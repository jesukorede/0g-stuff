import React, { useState } from 'react';

interface INFTMintFormProps {
  onMint: (data: {
    name: string;
    description: string;
    image: string;
    agentType: string;
    capabilities: string[];
    modelId: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const INFTMintForm: React.FC<INFTMintFormProps> = ({ onMint, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [agentType, setAgentType] = useState('general');
  const [capabilities, setCapabilities] = useState('');
  const [modelId, setModelId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !agentType || !modelId) return;

    const capabilitiesArray = capabilities
      .split(',')
      .map((cap) => cap.trim())
      .filter((cap) => cap !== '');

    await onMint({
      name,
      description,
      image,
      agentType,
      capabilities: capabilitiesArray,
      modelId,
    });

    // Reset form
    setName('');
    setDescription('');
    setImage('');
    setAgentType('general');
    setCapabilities('');
    setModelId('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Mint New INFT</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agent Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter agent name"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe what this agent does"
          />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL
          </label>
          <input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="agentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent Type *
            </label>
            <select
              id="agentType"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="general">General</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="multimodal">Multimodal</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="modelId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model ID *
            </label>
            <input
              id="modelId"
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0g-model-id"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="capabilities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Capabilities (comma-separated)
          </label>
          <input
            id="capabilities"
            type="text"
            value={capabilities}
            onChange={(e) => setCapabilities(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="text-generation, image-analysis, code-completion"
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Minting...' : 'Mint INFT'}
          </button>
        </div>
      </form>
    </div>
  );
};