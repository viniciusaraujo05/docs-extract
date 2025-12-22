import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SchemaField, type FieldType, type DocumentType, FIELD_TYPES } from '@/types/extraction';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Props {
    documentType: DocumentType;
}

/**
 * Página de edição de tipo de documento
 */
export default function DocumentTypesEdit({ documentType }: Props) {
    const { t } = useTranslation();
    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => [
        { title: t('Dashboard'), href: '/dashboard' },
        { title: t('Document Types'), href: '/document-types' },
        { title: documentType.name, href: `/document-types/${documentType.id}/edit` },
    ], [t, documentType.id, documentType.name]);

    const [name, setName] = useState(documentType.name);
    const [description, setDescription] = useState(documentType.description ?? '');
    const [fields, setFields] = useState<SchemaField[]>(documentType.fields);
    const [isActive, setIsActive] = useState(documentType.is_active);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<FieldType>('string');
    const [saving, setSaving] = useState(false);

    const formatFieldName = (value: string): string => {
        return value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    };

    const handleAddField = useCallback(() => {
        if (!newFieldName.trim() || !newFieldLabel.trim()) return;

        const fieldName = formatFieldName(newFieldName);
        if (fields.some(f => f.name === fieldName)) return;

        setFields(prev => [...prev, { name: fieldName, label: newFieldLabel, type: newFieldType }]);
        setNewFieldName('');
        setNewFieldLabel('');
        setNewFieldType('string');
    }, [fields, newFieldName, newFieldLabel, newFieldType]);

    const handleRemoveField = useCallback((fieldName: string) => {
        setFields(prev => prev.filter(f => f.name !== fieldName));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || fields.length === 0) return;

        setSaving(true);
        router.put(`/document-types/${documentType.id}`, {
            name,
            description,
            fields: JSON.stringify(fields),
            is_active: isActive,
        }, {
            onSuccess: () => {
                toast.success(t('Document type updated successfully!'));
            },
            onError: () => {
                toast.error(t('Error updating document type'));
            },
            onFinish: () => setSaving(false),
        });
    }, [documentType.id, name, description, fields, isActive]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Edit')} ${documentType.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">{t('Edit Document Type')}</h1>
                    <p className="text-muted-foreground">
                        {t('Update the document type settings')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Basic Information')}</CardTitle>
                            <CardDescription>
                                {t('Name and description of the document type')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('Name *')}</Label>
                                <Input
                                    id="name"
                                    placeholder={t('e.g. Supplier Invoice')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">{t('Description')}</Label>
                                <Textarea
                                    id="description"
                                    placeholder={t('Optional description')}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-active">{t('Active')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('Inactive types do not appear in the selection list')}
                                    </p>
                                </div>
                                <Switch
                                    id="is-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fields */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Fields to Extract')}</CardTitle>
                            <CardDescription>
                                {t('Define the fields that will be extracted automatically')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Current Fields */}
                            <div className="space-y-2">
                                <Label>{t('Defined Fields')} ({fields.length})</Label>
                                {fields.length === 0 ? (
                                    <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                        {t('Add at least one field below')}
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {fields.map((field) => (
                                            <Badge
                                                key={field.name}
                                                variant="secondary"
                                                className="flex items-center gap-1 py-1.5 pl-3 pr-1"
                                            >
                                                {field.label}
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    ({FIELD_TYPES.find(t => t.value === field.type)?.label})
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 hover:bg-destructive/20"
                                                    onClick={() => handleRemoveField(field.name)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Add Field */}
                            <div className="space-y-3">
                                <Label>{t('Add Field')}</Label>
                                <div className="grid gap-2">
                                    <Input
                                        placeholder={t('Internal name (e.g. total_sales)')}
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                    />
                                    <Input
                                        placeholder={t('Label (ex: Total de Vendas)')}
                                        value={newFieldLabel}
                                        onChange={(e) => setNewFieldLabel(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Select
                                            value={newFieldType}
                                            onValueChange={(v) => setNewFieldType(v as FieldType)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FIELD_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            onClick={handleAddField}
                                            disabled={!newFieldName.trim() || !newFieldLabel.trim()}
                                            className="flex-1"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('Add')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/document-types')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || fields.length === 0 || saving}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? t('Saving...') : t('Save Changes')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
