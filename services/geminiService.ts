import { GoogleGenAI } from "@google/genai";
import { GeneratedFile } from '../types';

const buildPrompt = (description: string): string => {
    return `
    Act as a senior DevOps engineer specializing in Ansible automation.
    Your task is to generate a complete and professional Ansible role based on the user's request.

    **User's Request:**
    ---
    ${description}
    ---

    **Instructions:**
    1.  Infer the role name from the user's request (e.g., 'nginx', 'docker', 'mysql'). If it's complex, use a descriptive name. The role name should be the top-level directory.
    2.  Create a standard Ansible role directory structure.
    3.  Generate the content for all necessary files, including:
        - \`defaults/main.yml\`: For default variables.
        - \`vars/main.yml\`: For non-overridable variables if needed.
        - \`tasks/main.yml\`: The main entry point for tasks. Break down complex logic into separate, included task files (e.g., \`tasks/install.yml\`, \`tasks/configure.yml\`).
        - \`handlers/main.yml\`: For service restarts and other handlers.
        - \`templates/...\`: Any necessary template files (e.g., configuration files, virtual hosts). Use the .j2 extension.
        - \`meta/main.yml\`: Role metadata, including dependencies if any can be inferred.
    4.  Ensure all YAML is valid and all Ansible modules are used correctly.
    5.  The code should be well-commented and follow Ansible best practices.

    **Output Format:**
    Return a single, valid JSON object. The keys must be the full file paths (e.g., 'rolename/tasks/main.yml'), and the values must be the complete content of each file as a string. Do not include any explanations, markdown formatting, or code fences outside of the JSON object. The entire response must be only the JSON object itself.
    `;
};

export const generateAnsibleRole = async (description: string): Promise<GeneratedFile[]> => {
    // FIX: Per coding guidelines, API key must be obtained exclusively from process.env.API_KEY. This also resolves the error "Property 'env' does not exist on type 'ImportMeta'".
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = buildPrompt(description);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.2,
        },
    });

    const text = response.text.trim();
    try {
        const jsonObject = JSON.parse(text);

        const files = Object.entries(jsonObject).map(([path, content]) => ({
            path,
            content: content as string,
        }));

        if (files.length === 0) {
            throw new Error("The model returned an empty set of files. Please try a different description.");
        }

        return files;

    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", text);
        if (e instanceof Error && e.message.includes("empty set of files")) {
            throw e;
        }
        throw new Error("Could not parse the generated content. The model may have returned an invalid format. Check the console for the raw response.");
    }
};