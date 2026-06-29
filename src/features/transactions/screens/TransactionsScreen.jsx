import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTransactions } from "../hooks/useTransactions.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    SHADOWS,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const typeConfig = {
    deposit: { text: "Deposito", color: COLORS.success, icon: "arrow-downward", isPositive: true },
    transfer_in: { text: "Transferencia Recibida", color: "#38bdf8", icon: "arrow-downward", isPositive: true },
    withdraw: { text: "Retiro", color: COLORS.warning, icon: "arrow-upward", isPositive: false },
    transfer_out: { text: "Transferencia Enviada", color: "#6366f1", icon: "arrow-upward", isPositive: false },
};

const formatPrice = (price, isPositive, forceSign = false) => {
    const formatted = `Q ${Number(price || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
    if (!forceSign) return formatted;
    return isPositive ? `+ ${formatted}` : `- ${formatted}`;
};

const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const TransactionsScreen = () => {
    const { transactions, loading, error, getMyTransactions } = useTransactions();
    const [selectedType, setSelectedType] = useState("ALL");

    const onRefresh = useCallback(() => {
        getMyTransactions();
    }, [getMyTransactions]);

    const filtered = transactions.filter((t) => {
        const config = typeConfig[t.type];
        if (!config) return false;
        if (selectedType === "ALL") return true;
        if (selectedType === "IN") return config.isPositive;
        if (selectedType === "OUT") return !config.isPositive;
        return true;
    });

    const totalIncome = transactions
        .filter((t) => typeConfig[t.type]?.isPositive)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = transactions
        .filter((t) => !typeConfig[t.type]?.isPositive)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const renderItem = ({ item }) => {
        const config = typeConfig[item.type] || typeConfig.deposit;
        return (
            <View style={styles.transactionCard}>
                <View style={[styles.transactionIcon, { backgroundColor: config.color + "15" }]}>
                    <MaterialIcons name={config.icon} size={18} color={config.color} />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDesc} numberOfLines={1}>
                        {item.description || config.text}
                    </Text>
                    <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: config.isPositive ? COLORS.success : COLORS.text }]}>
                        {formatPrice(item.amount, config.isPositive, true)}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: config.color + "15" }]}>
                        <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.text}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && !transactions.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Movimientos de Cuenta</Text>
                <Text style={styles.headerSubtitle}>Monitorea tus ingresos, egresos y transferencias</Text>
            </View>

            {/* RESUMEN */}
            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: COLORS.success + "15" }]}>
                        <MaterialIcons name="arrow-downward" size={18} color={COLORS.success} />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Total Ingresos</Text>
                        <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                            {loading ? "—" : formatPrice(totalIncome, true)}
                        </Text>
                    </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: COLORS.warning + "15" }]}>
                        <MaterialIcons name="arrow-upward" size={18} color={COLORS.warning} />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Total Salidas</Text>
                        <Text style={styles.summaryValue}>
                            {loading ? "—" : formatPrice(totalExpense, false)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* FILTROS */}
            <View style={styles.filters}>
                {[
                    { id: "ALL", label: "Todos" },
                    { id: "IN", label: "Ingresos" },
                    { id: "OUT", label: "Egresos" },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.filterTab, selectedType === tab.id && styles.filterTabActive]}
                        onPress={() => setSelectedType(tab.id)}
                    >
                        <Text style={[styles.filterTabText, selectedType === tab.id && styles.filterTabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* LISTA */}
            {error && !transactions.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState message="No hay transacciones registradas" />}
                />
            )}
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
    summary: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.lg,
        marginTop: -12,
        borderRadius: 16,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.md,
    },
    summaryItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: COLORS.border,
        marginHorizontal: 12,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: COLORS.text,
        marginTop: 2,
    },
    filters: {
        flexDirection: "row",
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterTabActive: {
        backgroundColor: COLORS.primary + "15",
        borderColor: COLORS.primary + "30",
    },
    filterTabText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.secondary,
    },
    filterTabTextActive: {
        color: COLORS.primary,
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.sm,
    },
    transactionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 14,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDesc: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
    },
    transactionDate: {
        fontSize: 11,
        color: COLORS.secondary,
        marginTop: 2,
    },
    transactionRight: {
        alignItems: "flex-end",
        gap: 4,
    },
    transactionAmount: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 9,
        fontWeight: "700",
    },
});

export default TransactionsScreen;
