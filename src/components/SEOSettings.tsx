import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Target, Link2, Hash } from "lucide-react";

export interface AnchorLink {
  anchor: string;
  url: string;
}

export interface SEOData {
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetWordCount: number;
  anchors: AnchorLink[];
}

interface SEOSettingsProps {
  value: SEOData;
  onChange: (data: SEOData) => void;
}

export const SEOSettings = ({ value, onChange }: SEOSettingsProps) => {
  const [newKeyword, setNewKeyword] = useState("");
  const [newAnchor, setNewAnchor] = useState({ anchor: "", url: "" });

  const addKeyword = () => {
    if (newKeyword.trim() && !value.secondaryKeywords.includes(newKeyword.trim())) {
      onChange({
        ...value,
        secondaryKeywords: [...value.secondaryKeywords, newKeyword.trim()]
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    onChange({
      ...value,
      secondaryKeywords: value.secondaryKeywords.filter(k => k !== keyword)
    });
  };

  const addAnchor = () => {
    if (newAnchor.anchor.trim() && newAnchor.url.trim()) {
      onChange({
        ...value,
        anchors: [...value.anchors, { ...newAnchor }]
      });
      setNewAnchor({ anchor: "", url: "" });
    }
  };

  const removeAnchor = (index: number) => {
    onChange({
      ...value,
      anchors: value.anchors.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">SEO & Link Settings</h3>
      </div>

      {/* Primary Keyword */}
      <div className="space-y-2">
        <Label htmlFor="primary-keyword">Primary Keyword</Label>
        <Input
          id="primary-keyword"
          placeholder="e.g., content repurposing"
          value={value.primaryKeyword}
          onChange={(e) => onChange({ ...value, primaryKeyword: e.target.value })}
        />
      </div>

      {/* Secondary Keywords */}
      <div className="space-y-3">
        <Label>Secondary Keywords</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add keyword..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
          />
          <Button type="button" size="sm" onClick={addKeyword}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {value.secondaryKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.secondaryKeywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="gap-2">
                <Hash className="w-3 h-3" />
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Target Word Count */}
      <div className="space-y-2">
        <Label htmlFor="word-count">Target Word Count</Label>
        <Input
          id="word-count"
          type="number"
          min="100"
          placeholder="e.g., 1000"
          value={value.targetWordCount || ""}
          onChange={(e) => onChange({ ...value, targetWordCount: parseInt(e.target.value) || 0 })}
        />
      </div>

      {/* Anchor Links */}
      <div className="space-y-3">
        <Label>Anchor Links (Internal/External)</Label>
        <div className="space-y-2">
          <Input
            placeholder="Anchor text (e.g., 'best hotels in Paros')"
            value={newAnchor.anchor}
            onChange={(e) => setNewAnchor({ ...newAnchor, anchor: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="URL (e.g., https://example.com/page)"
              value={newAnchor.url}
              onChange={(e) => setNewAnchor({ ...newAnchor, url: e.target.value })}
            />
            <Button type="button" size="sm" onClick={addAnchor}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {value.anchors.length > 0 && (
          <div className="space-y-2 mt-3">
            {value.anchors.map((anchor, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Link2 className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{anchor.anchor}</p>
                  <p className="text-xs text-muted-foreground truncate">{anchor.url}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAnchor(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
