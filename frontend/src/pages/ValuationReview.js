import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle, Edit, TrendingUp, Home } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export default function ValuationReview() {
    const [valuations, setValuations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedValuation, setSelectedValuation] = useState(null);
    const [reviewDialog, setReviewDialog] = useState(false);
    const [adjustedValue, setAdjustedValue] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchPendingValuations();
        fetchStats();
    }, []);

    const fetchPendingValuations = async () => {
        try {
            const response = await axios.get(`${API}/valuations/pending`);
            setValuations(response.data);
        } catch (error) {
            toast.error('Errore caricamento valutazioni');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API}/valuations/stats/summary`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const openReviewDialog = (valuation) => {
        setSelectedValuation(valuation);
        setAdjustedValue(valuation.ai_estimated_value?.toString() || '');
        setNotes('');
        setReviewDialog(true);
    };

    const handleReview = async (action) => {
        if (!selectedValuation) return;

        setSubmitting(true);

        try {
            const reviewData = {
                valuation_id: selectedValuation.id,
                action: action,
                notes: notes || undefined
            };

            if (action === 'adjust') {
                if (!adjustedValue || isNaN(parseFloat(adjustedValue))) {
                    toast.error('Inserisci un valore valido');
                    setSubmitting(false);
                    return;
                }
                reviewData.adjusted_value = parseFloat(adjustedValue);
            }

            await axios.post(
                `${API}/valuations/${selectedValuation.id}/review`,
                reviewData
            );

            toast.success(
                action === 'approve' ? 'Valutazione approvata!' :
                    action === 'adjust' ? 'Valutazione aggiustata e approvata!' :
                        'Valutazione rigettata'
            );

            setReviewDialog(false);
            fetchPendingValuations();
            fetchStats();
        } catch (error) {
            toast.error('Errore durante la review');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getConfidenceBadge = (score) => {
        if (score >= 0.8) return <Badge className="bg-green-500">Alta ({(score * 100).toFixed(0)}%)</Badge>;
        if (score >= 0.6) return <Badge className="bg-yellow-500">Media ({(score * 100).toFixed(0)}%)</Badge>;
        return <Badge className="bg-red-500">Bassa ({(score * 100).toFixed(0)}%)</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Review Valutazioni AI</h1>
                <p className="text-gray-600">
                    Approva, aggiusta o rigetta le valutazioni automatiche prima di inviarle ai clienti
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                In Attesa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_review}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Approvate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Rigettate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Accuracy AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.ai_accuracy ? `${(stats.ai_accuracy * 100).toFixed(0)}%` : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Valuations List */}
            <div className="grid grid-cols-1 gap-4">
                {valuations.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <p>Nessuna valutazione in attesa di review! 🎉</p>
                        </CardContent>
                    </Card>
                ) : (
                    valuations.map((valuation) => (
                        <Card key={valuation.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Home className="h-5 w-5" />
                                            {valuation.property_type} - {valuation.property_location}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Cliente: {valuation.client_name} • {valuation.client_phone}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        {new Date(valuation.created_at).toLocaleDateString('it-IT')}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Superficie</p>
                                        <p className="font-semibold">{valuation.square_meters} m²</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Camere</p>
                                        <p className="font-semibold">{valuation.bedrooms}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Bagni</p>
                                        <p className="font-semibold">{valuation.bathrooms}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Condizioni</p>
                                        <p className="font-semibold capitalize">{valuation.condition || 'N/A'}</p>
                                    </div>
                                </div>

                                {valuation.ai_estimated_value && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                                <span className="font-semibold text-blue-900">Valutazione AI</span>
                                            </div>
                                            {getConfidenceBadge(valuation.ai_confidence_score)}
                                        </div>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {formatCurrency(valuation.ai_estimated_value)}
                                        </div>
                                        {valuation.ai_comparable_properties?.length > 0 && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                Basato su {valuation.ai_comparable_properties.length} immobili comparabili
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleReview('approve')}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        disabled={submitting}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approva
                                    </Button>

                                    <Button
                                        onClick={() => openReviewDialog(valuation)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        disabled={submitting}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Aggiusta
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setSelectedValuation(valuation);
                                            handleReview('reject');
                                        }}
                                        variant="destructive"
                                        className="flex-1"
                                        disabled={submitting}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rigetta
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Aggiusta Valutazione</DialogTitle>
                        <DialogDescription>
                            Modifica il valore stimato dall'AI prima di inviarlo al cliente
                        </DialogDescription>
                    </DialogHeader>

                    {selectedValuation && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Valore AI Originale
                                </label>
                                <div className="text-2xl font-bold text-gray-400">
                                    {formatCurrency(selectedValuation.ai_estimated_value)}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Nuovo Valore (€)
                                </label>
                                <Input
                                    type="number"
                                    value={adjustedValue}
                                    onChange={(e) => setAdjustedValue(e.target.value)}
                                    placeholder="Es: 250000"
                                    className="text-lg"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Note (opzionale)
                                </label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Motivo dell'aggiustamento..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleReview('adjust')}
                                    className="flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Conferma e Invia
                                </Button>

                                <Button
                                    onClick={() => setReviewDialog(false)}
                                    variant="outline"
                                    disabled={submitting}
                                >
                                    Annulla
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
