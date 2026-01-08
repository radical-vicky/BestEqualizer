import { Music2, Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  theme: 'dark' | 'light';
  colorScheme: 'cyan' | 'purple' | 'green';
  onThemeChange: (theme: 'dark' | 'light') => void;
  onColorSchemeChange: (scheme: 'cyan' | 'purple' | 'green') => void;
}

const colorSchemes = [
  { id: 'cyan', label: 'Neon Cyan', color: 'hsl(190, 100%, 50%)' },
  { id: 'purple', label: 'Neon Purple', color: 'hsl(280, 100%, 60%)' },
  { id: 'green', label: 'Neon Green', color: 'hsl(150, 100%, 45%)' },
] as const;

export function Header({
  theme,
  colorScheme,
  onThemeChange,
  onColorSchemeChange,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-subtle">
            <Music2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-glow">
              Boom System FX
            </h1>
            <p className="text-xs text-muted-foreground">
              Professional Audio Equalizer
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Color Scheme */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {colorSchemes.map(scheme => (
                <DropdownMenuItem
                  key={scheme.id}
                  onClick={() => onColorSchemeChange(scheme.id)}
                  className="gap-2"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scheme.color }}
                  />
                  {scheme.label}
                  {colorScheme === scheme.id && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
