import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '../types';
import { FileIcon, FolderIcon, LoadingSpinner, DownloadIcon } from './icons';

interface CodeDisplayProps {
    files: GeneratedFile[];
    isLoading: boolean;
    error: string | null;
    onDownloadZip: () => void;
}

interface TreeNode {
    name: string;
    children?: { [key: string]: TreeNode };
    file?: GeneratedFile;
}

const buildFileTree = (files: GeneratedFile[]): TreeNode => {
    const root: TreeNode = { name: 'root', children: {} };
    files.forEach(file => {
        const parts = file.path.split('/');
        let currentNode = root;
        parts.forEach((part, index) => {
            if (!currentNode.children) {
                currentNode.children = {};
            }
            if (!currentNode.children[part]) {
                currentNode.children[part] = { name: part };
            }
            currentNode = currentNode.children[part];
            if (index === parts.length - 1) {
                currentNode.file = file;
            }
        });
    });
    return root;
};

const FileTree: React.FC<{ node: TreeNode; onFileSelect: (file: GeneratedFile) => void; selectedPath: string; level?: number }> = ({ node, onFileSelect, selectedPath, level = 0 }) => {
    const isDirectory = !!node.children;
    const isSelected = node.file?.path === selectedPath;

    if (isDirectory) {
        return (
            <div>
                <div className="flex items-center pl-4 cursor-pointer text-gray-300">
                     <FolderIcon className="w-5 h-5 mr-2 text-cyan-400" />
                    <span>{node.name}</span>
                </div>
                <div style={{ marginLeft: `${level * 1}rem` }}>
                    {/* FIX: Cast result of Object.values to TreeNode[] to resolve typing error for sort and map callbacks. */}
                    {(Object.values(node.children) as TreeNode[]).sort((a,b) => a.name.localeCompare(b.name)).map(child => (
                        <FileTree key={child.name} node={child} onFileSelect={onFileSelect} selectedPath={selectedPath} level={level + 1} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`flex items-center pl-4 pr-2 py-1.5 cursor-pointer text-sm rounded-md transition-colors ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}
            onClick={() => node.file && onFileSelect(node.file)}
            style={{ marginLeft: `${level * 1}rem` }}
        >
            <FileIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{node.name}</span>
        </div>
    );
};


export const CodeDisplay: React.FC<CodeDisplayProps> = ({ files, isLoading, error, onDownloadZip }) => {
    const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
    const hasFiles = files.length > 0;

    useEffect(() => {
        if (files.length > 0) {
            const mainTaskFile = files.find(f => f.path.endsWith('tasks/main.yml')) || files[0];
            setSelectedFile(mainTaskFile);
        } else {
            setSelectedFile(null);
        }
    }, [files]);
    
    const fileTree = files.length > 0 ? buildFileTree(files) : null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <LoadingSpinner className="w-8 h-8 mb-4" />
                    <p className="text-lg">Generating your Ansible role...</p>
                    <p className="text-sm">This might take a moment.</p>
                </div>
            );
        }
        if (error) {
             return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                     <p className="text-lg font-semibold text-red-400">An Error Occurred</p>
                     <p className="mt-2 text-red-300 bg-red-900/50 p-4 rounded-md">{error}</p>
                 </div>
            );
        }
        if (files.length === 0) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
                     <p className="text-lg">Your generated code will appear here.</p>
                     <p>Describe the role you need and click "Generate".</p>
                 </div>
            );
        }
        return (
            <div className="flex flex-col h-full">
                <div className="col-span-9 p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-cyan-300">{selectedFile?.path}</span>
                    <button
                        onClick={onDownloadZip}
                        disabled={!hasFiles || isLoading}
                        className="flex items-center bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold py-1.5 px-3 rounded-md transition duration-200 ease-in-out"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download as ZIP
                    </button>
                </div>
                <div className="grid grid-cols-12 gap-0 h-full overflow-hidden">
                    <div className="col-span-3 bg-gray-900/70 border-r border-gray-700 overflow-y-auto py-2">
                        {fileTree && fileTree.children && (Object.values(fileTree.children) as TreeNode[]).map(node => (
                             <FileTree key={node.name} node={node} onFileSelect={setSelectedFile} selectedPath={selectedFile?.path || ''} />
                        ))}
                    </div>
                    <div className="col-span-9 relative">
                        {selectedFile ? (
                            <pre className="p-4 text-sm whitespace-pre-wrap overflow-auto h-full">
                                <code className="font-mono">{selectedFile.content}</code>
                            </pre>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Select a file to view its content.</div>
                        )}
                    </div>
                </div>
            </div>
        )
    };
    
    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-[calc(100vh-10rem)] min-h-[600px]">
            {renderContent()}
        </div>
    );
};