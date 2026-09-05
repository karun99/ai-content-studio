import os
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Content Studio - Python Service",
              description="Hugging Face Transformers & llama.cpp inference")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = os.getenv("HF_MODEL_NAME", "microsoft/phi-2")
DEVICE = os.getenv("DEVICE", "cuda" if os.system("nvidia-smi -L > /dev/null 2>&1") == 0 else "cpu")

# Lazy loading to avoid startup delay
_tokenizer = None
_model = None
_llm = None


def get_hf_model():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        import torch
        logger.info(f"Loading HF model: {MODEL_NAME}")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        torch_dtype = torch.float16 if DEVICE == "cuda" else torch.float32
        _model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME, torch_dtype=torch_dtype
        ).to(DEVICE)
        _model.eval()
    return _tokenizer, _model


def get_llamacpp():
    global _llm
    if _llm is None:
        model_path = os.getenv("LLAMACPP_MODEL_PATH")
        if not model_path:
            raise ValueError("LLAMACPP_MODEL_PATH not set")
        import llama_cpp
        logger.info(f"Loading llama.cpp model: {model_path}")
        _llm = llama_cpp.Llama(
            model_path=model_path,
            n_ctx=int(os.getenv("LLAMACPP_CONTEXT_SIZE", "2048")),
        )
    return _llm


class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Input prompt")
    model: Optional[str] = None
    max_tokens: int = Field(256, ge=1, le=8192)
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(0.95, ge=0.0, le=1.0)
    top_k: int = Field(40, ge=1)
    stop: Optional[list] = None


class LLaMACPPRequest(BaseModel):
    prompt: str = Field(..., description="Input prompt")
    max_tokens: int = Field(256, ge=1, le=8192)
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(0.95, ge=0.0, le=1.0)
    top_k: int = Field(40, ge=1)
    repeat_penalty: float = Field(1.1, ge=0.0)


class EmbeddingRequest(BaseModel):
    text: str
    model: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model: str
    device: str
    llamacpp_loaded: bool


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        model=MODEL_NAME,
        device=DEVICE,
        llamacpp_loaded=_llm is not None,
    )


@app.post("/generate")
async def generate(req: GenerateRequest):
    try:
        tokenizer, model = get_hf_model()
        import torch

        inputs = tokenizer(req.prompt, return_tensors="pt").to(DEVICE)
        generate_kwargs = {
            "max_new_tokens": req.max_tokens,
            "temperature": req.temperature,
            "do_sample": True,
            "top_p": req.top_p,
            "top_k": req.top_k,
            "pad_token_id": tokenizer.eos_token_id,
        }
        if req.stop:
            generate_kwargs["eos_token_id"] = [tokenizer.encode(s, add_special_tokens=False)[0]
                                                for s in req.stop]

        with torch.no_grad():
            outputs = model.generate(**inputs, **generate_kwargs)

        text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Remove the input prompt from the output
        if text.startswith(req.prompt):
            text = text[len(req.prompt):].strip()

        return {"text": text, "model": req.model or MODEL_NAME}
    except Exception as e:
        logger.error(f"Generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/llamacpp")
async def llamacpp_generate(req: LLaMACPPRequest):
    try:
        llm = get_llamacpp()
        result = llm(
            req.prompt,
            max_tokens=req.max_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            top_k=req.top_k,
            repeat_penalty=req.repeat_penalty,
        )
        return {"text": result["choices"][0]["text"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"llama.cpp error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embeddings")
async def embeddings(req: EmbeddingRequest):
    """Generate embeddings for ChromaDB"""
    try:
        tokenizer, model = get_hf_model()
        import torch

        inputs = tokenizer(req.text, return_tensors="pt", truncation=True, max_length=512).to(DEVICE)
        with torch.no_grad():
            outputs = model(**inputs)
            # Use last hidden state mean pooling
            embedding = outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy().tolist()
        return {"embedding": embedding, "dim": len(embedding), "model": req.model or MODEL_NAME}
    except Exception as e:
        logger.error(f"Embedding error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
