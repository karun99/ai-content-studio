import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Editor from './components/Editor/Editor';
import KnowledgeBase from './components/KnowledgeBase/Search';
import DataCollector from './components/DataCollector/Collector';
import FileParser from './components/FileParser/Parser';
import ModelLab from './components/ModelLab/Lab';
import ModelBuilder from './components/ModelBuilder/Builder';
import ExportManager from './components/Export/ExportManager';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/collector" element={<DataCollector />} />
            <Route path="/parser" element={<FileParser />} />
            <Route path="/lab" element={<ModelLab />} />
            <Route path="/builder" element={<ModelBuilder />} />
            <Route path="/export" element={<ExportManager />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
