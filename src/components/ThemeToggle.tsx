import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

const themes = [
  { value: 'light', label: 'Light Calm', description: 'Soft gradients & gentle colors' },
  { value: 'dark', label: 'Dark Comfort', description: 'Soothing dark tones' },
  { value: 'theme-lavender', label: 'Lavender Peace', description: 'Lavender dominant theme' },
  { value: 'theme-ocean', label: 'Ocean Blue', description: 'Deep ocean tranquility' },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden md:inline">Themes</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`cursor-pointer ${theme === themeOption.value ? 'bg-accent' : ''}`}
          >
            <div>
              <div className="font-medium">{themeOption.label}</div>
              <div className="text-xs text-muted-foreground">{themeOption.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}