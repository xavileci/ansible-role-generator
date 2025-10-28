import React, { useState } from 'react';
import { LoadingSpinner } from './icons';

interface AnsibleFormProps {
    onSubmit: (description: string) => void;
    isLoading: boolean;
}

export const AnsibleForm: React.FC<AnsibleFormProps> = ({ onSubmit, isLoading }) => {
    const [description, setDescription] = useState<string>('An Ansible role to install and configure nginx on Ubuntu 22.04. It should include a task to set up a default virtual host from a template file.');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onSubmit(description);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
             <div className="flex flex-col flex-grow">
                <label htmlFor="role-description" className="block text-lg font-semibold text-cyan-400 mb-2">Describe the Ansible Role</label>
                <p className="text-sm text-gray-400 mb-4">
                    Provide a detailed description of the role you want to generate. Include the software, operating system, and any specific configuration details.
                </p>
                <textarea
                    id="role-description"
                    name="role-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full flex-grow bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
                    placeholder="e.g., An Ansible role to install Docker on Debian 11 and add the current user to the docker group."
                />
            </div>

            <button
                type="submit"
                disabled={isLoading || !description.trim()}
                className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg shadow-cyan-500/20 disabled:shadow-none"
            >
                {isLoading ? <><LoadingSpinner /> Generating...</> : 'Generate Ansible Role'}
            </button>
        </form>
    );
};