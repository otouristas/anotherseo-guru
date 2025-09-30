import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Layout } from "lucide-react";

const tones = [
  { value: "professional", label: "Professional", description: "Formal and business-appropriate" },
  { value: "conversational", label: "Conversational", description: "Friendly and approachable" },
  { value: "humorous", label: "Humorous", description: "Light and entertaining" },
  { value: "academic", label: "Academic", description: "Scholarly and research-focused" },
  { value: "persuasive", label: "Persuasive", description: "Compelling and action-oriented" },
  { value: "empathetic", label: "Empathetic", description: "Understanding and supportive" },
];

const styles = [
  { value: "narrative", label: "Narrative", description: "Story-driven flow" },
  { value: "listicle", label: "Listicle", description: "Bullet points and lists" },
  { value: "how-to", label: "How-To", description: "Step-by-step guide" },
  { value: "analytical", label: "Analytical", description: "Data-driven insights" },
  { value: "opinion", label: "Opinion", description: "Personal perspective" },
  { value: "interview", label: "Interview", description: "Q&A format" },
];

interface ToneStyleSelectorProps {
  tone: string;
  style: string;
  onToneChange: (tone: string) => void;
  onStyleChange: (style: string) => void;
}

export const ToneStyleSelector = ({ tone, style, onToneChange, onStyleChange }: ToneStyleSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <Label>Tone</Label>
        </div>
        <Select value={tone} onValueChange={onToneChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            {tones.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-primary" />
          <Label>Style</Label>
        </div>
        <Select value={style} onValueChange={onStyleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
