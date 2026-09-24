// @ts-nocheck
import React from 'react';

const ModelInfo = ({ modelVersion, source, confidence }: { modelVersion: string, source: string, confidence?: number }) => {
  return (
    <div className="bg-darkslate p-4 rounded-xl border border-gray-700 mt-4 space-y-2 text-sm text-gray-400">
      <div className="flex justify-between">
        <span className="font-semibold text-gray-300">Model Version:</span>
        <span className="font-mono text-blue-400">{modelVersion}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-gray-300">Data Source:</span>
        <span>{source}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-gray-300">Confidence:</span>
        <span>{confidence !== null && confidence !== undefined ? `${(confidence * 100).toFixed(0)}%` : 'NOT AVAILABLE'}</span>
      </div>
    </div>
  );
};

export default ModelInfo;
