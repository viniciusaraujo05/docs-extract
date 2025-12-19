import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type DocumentType } from '@/types/extraction';
import { Head, Link, router } from '@inertiajs/react';
import { FileType, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tipos de Documento', href: '/document-types' },
];

interface Props {
    documentTypes: DocumentType[];
}

/**
 * Página de listagem de tipos de documentos
 */
export default function DocumentTypesIndex({ documentTypes }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja eliminar este tipo de documento?')) {
            router.delete(`/document-types/${id}`, {
                onSuccess: () => {
                    toast.success('Tipo de documento eliminado com sucesso!');
                },
                onError: () => {
                    toast.error('Erro ao eliminar tipo de documento');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Tipos de Documento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tipos de Documento</h1>
                        <p className="text-muted-foreground">
                            Crie templates com campos pré-definidos para extrações mais rápidas
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/document-types/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Tipo
                        </Link>
                    </Button>
                </div>

                {/* List */}
                {documentTypes.length === 0 ? (
                    <Card className="mx-auto w-full max-w-lg">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-full bg-muted p-4">
                                <FileType className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Nenhum tipo criado</h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Crie tipos de documentos para agilizar a extração de dados
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/document-types/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Primeiro Tipo
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {documentTypes.map((type) => (
                            <Card key={type.id} className="group transition-shadow hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{type.name}</CardTitle>
                                                {type.description && (
                                                    <CardDescription className="line-clamp-1">
                                                        {type.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={type.is_active ? 'default' : 'secondary'}>
                                            {type.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                Campos ({type.fields.length})
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {type.fields.slice(0, 5).map((field) => (
                                                    <Badge key={field.name} variant="outline" className="text-xs">
                                                        {field.label}
                                                    </Badge>
                                                ))}
                                                {type.fields.length > 5 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{type.fields.length - 5}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                asChild
                                            >
                                                <Link href={`/document-types/${type.id}/edit`}>
                                                    <Pencil className="mr-2 h-3 w-3" />
                                                    Editar
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(type.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
