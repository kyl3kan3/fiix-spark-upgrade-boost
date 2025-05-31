
import React from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

interface DisplaySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface DisplaySettingsProps {
  settings: DisplaySetting[];
  dashboardLayout: string;
  onToggle: (id: string) => void;
  onLayoutChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  settings,
  dashboardLayout,
  onToggle,
  onLayoutChange,
}) => {
  const { theme, setTheme } = useTheme();
  
  const handleDarkModeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    onToggle('darkMode');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Display Settings</h3>
      <div className="grid gap-4">
        <div className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700 dark:bg-gray-800/50">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme for the application</p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={handleDarkModeToggle}
            className="cursor-pointer"
          />
        </div>
        
        {settings.filter(setting => setting.id !== 'darkMode').map((setting) => (
          <div 
            key={setting.id} 
            className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div>
              <p className="font-medium">{setting.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
            </div>
            <Switch
              checked={setting.enabled}
              onCheckedChange={() => onToggle(setting.id)}
              className="cursor-pointer"
            />
          </div>
        ))}
        
        <div className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700 dark:bg-gray-800/50">
          <div>
            <p className="font-medium">Dashboard Layout</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred dashboard layout</p>
          </div>
          <select 
            className="border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={dashboardLayout}
            onChange={onLayoutChange}
          >
            <option>Default</option>
            <option>Compact</option>
            <option>Detailed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
