import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface PRDDisplayProps {
  prdContent: string;
  onAccept?: (content: string) => void;
  onSave?: (content: string) => void;
}

export function PRDDisplay({ prdContent, onAccept, onSave }: PRDDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(prdContent);
  const [deploymentPlan, setDeploymentPlan] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    onSave?.(editedContent);
  };

  const handleAccept = () => {
    onAccept?.(editedContent);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([editedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final-prd.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([editedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final-prd.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = async () => {
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prdContent: editedContent }),
      });
      
      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Get the blob directly without checking content type
      const blob = await response.blob();
      
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'final-prd.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const generateDeploymentPlan = async () => {
    try {
      setIsGeneratingPlan(true);
      const response = await fetch('/api/generate-deployment-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prdContent: editedContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate deployment plan');
      }

      const data = await response.json();
      setDeploymentPlan(data.deploymentPlan);
    } catch (error) {
      console.error('Failed to generate deployment plan:', error);
      alert('Failed to generate deployment plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="prose max-w-none dark:prose-invert p-6">
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[600px] p-4 border rounded-lg font-sans text-base"
          />
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditedContent(prdContent);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-base">
            {editedContent}
          </pre>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit PRD
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Accept PRD
            </button>
            <div className="flex gap-2">
              <button
                onClick={downloadAsTxt}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Download as TXT
              </button>
              <button
                onClick={downloadAsMarkdown}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Download as MD
              </button>
              <button
                onClick={downloadAsPdf}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Download as PDF
              </button>
              <button
                onClick={generateDeploymentPlan}
                disabled={isGeneratingPlan}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {isGeneratingPlan ? 'Generating Plan...' : 'Generate Deployment Plan'}
              </button>
            </div>
          </div>

          {/* Display Deployment Plan */}
          {deploymentPlan && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-xl font-bold mb-4">Suggested Deployment Plan</h3>
              <pre className="whitespace-pre-wrap font-sans text-base bg-gray-50 p-4 rounded-lg">
                {deploymentPlan}
              </pre>
              <button
                onClick={() => {
                  const blob = new Blob([deploymentPlan], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'deployment-plan.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Download Deployment Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
