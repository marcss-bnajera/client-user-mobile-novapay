import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAccounts } from "../../accounts/hooks/useAccounts.js";
import { useCurrencies } from "../hooks/useCurrencies.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const availableCurrencies = [
    { code: "USD", symbol: "$", label: "Dolar estadounidense", flag: "US" },
    { code: "EUR", symbol: "\u20AC", label: "Euro", flag: "EU" },
    { code: "GBP", symbol: "\u00A3", label: "Libra esterlina", flag: "GB" },
    { code: "MXN", symbol: "$", label: "Peso mexicano", flag: "MX" },
];

const currencyColors = {
    USD: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    EUR: { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    GBP: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    MXN: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

const formatBalance = (amount, symbol = "") =>
    `${symbol}${Number(amount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

const CurrenciesScreen = () => {
    const { accounts, loading: accountsLoading } = useAccounts();
    const { result, loading, convertCurrency } = useCurrencies();
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(availableCurrencies[0]);

    useEffect(() => {
        if (accounts.length > 0 && !selectedAccount) {
            setSelectedAccount(accounts[0]);
        }
    }, [accounts]);

    const handleConvert = async () => {
        if (!selectedAccount?.numero_cuenta) return;
        try {
            await convertCurrency(selectedAccount.numero_cuenta, selectedCurrency.code);
        } catch (err) {
            // error handled in hook
        }
    };

    const colorResult = result ? (currencyColors[result.moneda_destino] || currencyColors.USD) : null;

    if (accountsLoading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Divisas</Text>
                <Text style={styles.headerSubtitle}>Consulta el valor de tu saldo en otras monedas</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* SELECTOR CUENTA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Selecciona una cuenta</Text>
                    {accounts.length === 0 ? (
                        <EmptyState message="No tienes cuentas activas" />
                    ) : (
                        accounts.map((account) => {
                            const isSelected = selectedAccount?.id === account.id;
                            return (
                                <TouchableOpacity
                                    key={account.id}
                                    style={[styles.accountOption, isSelected && styles.accountOptionActive]}
                                    onPress={() => setSelectedAccount(account)}
                                >
                                    <View>
                                        <Text style={styles.accountName}>
                                            {account.nombre_cuenta || account.tipo || "Cuenta"}
                                        </Text>
                                        <Text style={styles.accountNumber}>**** {account.numero_cuenta?.slice(-4)}</Text>
                                    </View>
                                    <Text style={styles.accountBalance}>{formatBalance(account.balance, "Q ")}</Text>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                {/* SELECTOR MONEDA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Moneda destino</Text>
                    <View style={styles.currencyGrid}>
                        {availableCurrencies.map((currency) => {
                            const isSelected = selectedCurrency.code === currency.code;
                            const c = currencyColors[currency.code] || currencyColors.USD;
                            return (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[styles.currencyOption, isSelected && { backgroundColor: c.bg, borderColor: c.color + "30" }]}
                                    onPress={() => setSelectedCurrency(currency)}
                                >
                                    <Text style={styles.currencyFlag}>{currency.flag}</Text>
                                    <View style={styles.currencyInfo}>
                                        <Text style={styles.currencyCode}>{currency.code}</Text>
                                        <Text style={styles.currencyLabel}>{currency.label}</Text>
                                    </View>
                                    <Text style={[styles.currencySymbol, { color: c.color }]}>{currency.symbol}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* BOTON */}
                <TouchableOpacity
                    style={[styles.convertButton, (loading || !selectedAccount) && styles.convertButtonDisabled]}
                    onPress={handleConvert}
                    disabled={loading || !selectedAccount}
                >
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <MaterialIcons name="swap-horiz" size={18} color="#fff" />
                            <Text style={styles.convertButtonText}>Convertir saldo</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* RESULTADO */}
                <View style={styles.resultSection}>
                    {!result && !loading && (
                        <View style={styles.resultEmpty}>
                            <MaterialIcons name="swap-horiz" size={32} color={COLORS.secondary} />
                            <Text style={styles.resultEmptyText}>Selecciona una cuenta y moneda</Text>
                        </View>
                    )}

                    {result && !loading && (
                        <View>
                            <Text style={styles.resultTitle}>Resultado de conversion</Text>

                            <View style={styles.resultCard}>
                                <View style={styles.resultRow}>
                                    <View style={styles.resultLeft}>
                                        <Text style={styles.resultFlag}>GT</Text>
                                        <View>
                                            <Text style={styles.resultLabel}>Saldo original</Text>
                                            <Text style={styles.resultAccountName}>
                                                {selectedAccount?.nombre_cuenta || "Cuenta"}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.resultValue}>{result.balance_quetzales}</Text>
                                </View>

                                <View style={styles.resultArrow}>
                                    <View style={styles.arrowCircle}>
                                        <MaterialIcons name="swap-horiz" size={14} color={COLORS.success} />
                                    </View>
                                </View>

                                <View style={[styles.resultCardConverted, { backgroundColor: colorResult?.bg, borderColor: colorResult?.color + "30" }]}>
                                    <View style={styles.resultLeft}>
                                        <Text style={styles.resultFlag}>{selectedCurrency.flag}</Text>
                                        <View>
                                            <Text style={styles.resultLabel}>Equivalente en</Text>
                                            <Text style={styles.resultAccountName}>{selectedCurrency.label}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.resultValueLarge, { color: colorResult?.color }]}>
                                        {result.balance_convertido}
                                    </Text>
                                </View>

                                <View style={styles.exchangeRate}>
                                    <MaterialIcons name="trending-up" size={12} color={COLORS.secondary} />
                                    <Text style={styles.exchangeRateText}>
                                        1 GTQ = {result.tipo_cambio} {result.moneda_destino}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* INFO MONEDAS */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <MaterialIcons name="attach-money" size={14} color={COLORS.success} />
                        <Text style={styles.sectionTitle}>Monedas disponibles</Text>
                    </View>
                    {availableCurrencies.map((currency) => {
                        const c = currencyColors[currency.code] || currencyColors.USD;
                        return (
                            <View key={currency.code} style={styles.currencyInfoCard}>
                                <View style={styles.currencyInfoLeft}>
                                    <Text style={styles.currencyInfoFlag}>{currency.flag}</Text>
                                    <View>
                                        <Text style={styles.currencyInfoCode}>{currency.code}</Text>
                                        <Text style={styles.currencyInfoLabel}>{currency.label}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.currencyInfoSymbol, { color: c.color }]}>{currency.symbol}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "700",
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: "rgba(255,255,255,0.6)",
        marginTop: 4,
    },
    scrollContent: {
        padding: SPACING.lg,
        gap: 16,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    accountOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    accountOptionActive: {
        backgroundColor: COLORS.success + "10",
        borderColor: COLORS.success + "30",
    },
    accountName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
    },
    accountNumber: {
        fontSize: 11,
        color: COLORS.secondary,
        fontFamily: "monospace",
        marginTop: 2,
    },
    accountBalance: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        color: COLORS.success,
    },
    currencyGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    currencyOption: {
        flexDirection: "row",
        alignItems: "center",
        width: "48%",
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 8,
    },
    currencyFlag: {
        fontSize: 20,
    },
    currencyInfo: {
        flex: 1,
    },
    currencyCode: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },
    currencyLabel: {
        fontSize: 10,
        color: COLORS.secondary,
    },
    currencySymbol: {
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: "700",
    },
    convertButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.success,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    convertButtonDisabled: {
        opacity: 0.6,
    },
    convertButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: "#fff",
    },
    resultSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 150,
        justifyContent: "center",
    },
    resultEmpty: {
        alignItems: "center",
        paddingVertical: 24,
    },
    resultEmptyText: {
        fontSize: 13,
        color: COLORS.secondary,
        marginTop: 8,
    },
    resultTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    resultCard: {
        gap: 12,
    },
    resultRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    resultFlag: {
        fontSize: 18,
    },
    resultLabel: {
        fontSize: 10,
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    resultAccountName: {
        fontSize: 12,
        fontWeight: "500",
        color: COLORS.text,
    },
    resultValue: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
    },
    resultArrow: {
        alignItems: "center",
    },
    arrowCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.success + "15",
        borderWidth: 1,
        borderColor: COLORS.success + "30",
        justifyContent: "center",
        alignItems: "center",
    },
    resultCardConverted: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    resultValueLarge: {
        fontSize: 18,
        fontWeight: "700",
    },
    exchangeRate: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },
    exchangeRateText: {
        fontSize: 11,
        color: COLORS.secondary,
    },
    currencyInfoCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    currencyInfoLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    currencyInfoFlag: {
        fontSize: 16,
    },
    currencyInfoCode: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.text,
    },
    currencyInfoLabel: {
        fontSize: 10,
        color: COLORS.secondary,
    },
    currencyInfoSymbol: {
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: "700",
    },
});

export default CurrenciesScreen;
