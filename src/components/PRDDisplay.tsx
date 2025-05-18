import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  FileText, 
  FileType,
  Rocket,
  Edit,
  Check,
  X 
} from "lucide-react";

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
    <Card className="border shadow-md">
      <CardContent className="p-6 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="default">
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button 
                onClick={() => {
                  setEditedContent(prdContent);
                  setIsEditing(false);
                }}
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {editedContent}
              </pre>
            </ScrollArea>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleAccept} variant="default">
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              
              <div className="flex gap-2">
                <Button onClick={downloadAsTxt} variant="secondary" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  TXT
                </Button>
                <Button onClick={downloadAsMarkdown} variant="secondary" size="sm">
                  <FileType className="mr-2 h-4 w-4" />
                  MD
                </Button>
                <Button onClick={downloadAsPdf} variant="secondary" size="sm">
                  <FileType className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
              
              <Button 
                onClick={generateDeploymentPlan}
                disabled={isGeneratingPlan}
                variant="default"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {isGeneratingPlan ? 'Generating...' : 'Generate Plan'}
              </Button>
            </div>

            {deploymentPlan && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl">Deployment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {deploymentPlan}
                    </pre>
                  </ScrollArea>
                  <Button 
                    onClick={() => {/* existing download logic */}}
                    className="mt-4"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
