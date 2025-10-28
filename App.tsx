import React, { useState } from 'react';
import JSZip from 'jszip';
import { AnsibleForm } from './components/AnsibleForm';
import { CodeDisplay } from './components/CodeDisplay';
import { GeneratedFile } from './types';
import { generateAnsibleRole } from './services/geminiService';
import { GithubIcon } from './components/icons';

const App: React.FC = () => {
    const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (description: string) => {
        setIsLoading(true);
        setError(null);
        setGeneratedFiles([]);

        try {
            const files = await generateAnsibleRole(description);
            setGeneratedFiles(files);
        } catch (err) {
            setError(err instanceof Error ? `Generation failed: ${err.message}` : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadZip = async () => {
        if (generatedFiles.length === 0) return;

        // Heuristic to find the root directory name from the first file path
        const rootDir = generatedFiles[0]?.path.split('/')[0] || 'ansible_role';

        const zip = new JSZip();
        generatedFiles.forEach(file => {
            // JSZip can create folders from the path
            zip.file(file.path, file.content);
        });

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${rootDir}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Failed to generate zip file', err);
            setError('Failed to generate zip file.');
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold text-cyan-400">Ansible Role Generator</h1>
                        <a href="https://github.com/google/prompt-gallery" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <GithubIcon className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <AnsibleForm onSubmit={handleGenerate} isLoading={isLoading} />
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9">
                        <CodeDisplay 
                            files={generatedFiles} 
                            isLoading={isLoading} 
                            error={error} 
                            onDownloadZip={handleDownloadZip}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;