import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Store } from 'lucide-react';
import { useStoreSettings, useUpdateStoreSettings, type StoreSettings } from '@/hooks/useSiteSettings';

const CURRENCIES = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'SEK', label: 'kr SEK' },
  { value: 'NOK', label: 'kr NOK' },
  { value: 'DKK', label: 'kr DKK' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
  { value: 'CHF', label: 'Fr CHF' },
  { value: 'JPY', label: '¥ JPY' },
];

export function StoreSettingsPanel() {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();
  const [local, setLocal] = useState<StoreSettings | null>(null);

  useEffect(() => {
    if (settings && !local) setLocal(settings);
  }, [settings]);

  if (isLoading || !local) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = JSON.stringify(local) !== JSON.stringify(settings);

  const handleSave = () => {
    if (local) updateSettings.mutate(local);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Store Settings</CardTitle>
              <CardDescription>Currency, tax, and general store configuration</CardDescription>
            </div>
          </div>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Store name</Label>
          <Input
            value={local.storeName}
            onChange={(e) => setLocal(s => s ? { ...s, storeName: e.target.value } : s)}
            placeholder="My Store"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default currency</Label>
            <Select
              value={local.currency}
              onValueChange={(v) => setLocal(s => s ? { ...s, currency: v } : s)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tax rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={local.taxRate}
              onChange={(e) => setLocal(s => s ? { ...s, taxRate: parseFloat(e.target.value) || 0 } : s)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax display</Label>
            <Select
              value={local.taxDisplay}
              onValueChange={(v: 'inclusive' | 'exclusive' | 'hidden') => setLocal(s => s ? { ...s, taxDisplay: v } : s)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hidden">Don't show tax</SelectItem>
                <SelectItem value="inclusive">Price incl. tax</SelectItem>
                <SelectItem value="exclusive">Price + tax</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tax label</Label>
            <Input
              value={local.taxLabel}
              onChange={(e) => setLocal(s => s ? { ...s, taxLabel: e.target.value } : s)}
              placeholder="VAT"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
