import React, { useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAccounts } from "../hooks/useAccounts.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    SHADOWS,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const cuentaConfig = {
    MONETARIA: { text: "Monetaria", color: "#10b981", icon: "account-balance-wallet" },
    AHORRO: { text: "Ahorro", color: "#38bdf8", icon: "savings" },
    AHORRO_PROGRAMADO: { text: "Ahorro Programado", color: "#8b5cf6", icon: "schedule" },
};

const AccountsScreen = () => {
    const { accounts, loading, error, getMyAccounts } = useAccounts();

    const onRefresh = useCallback(() => {
        getMyAccounts();
    }, [getMyAccounts]);

    const formatBalance = (balance) => {
        return `Q ${Number(balance || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

    const renderItem = ({ item }) => {
        const config = cuentaConfig[item.tipo_cuenta] || cuentaConfig.MONETARIA;
        return (
            <View style={styles.accountCard}>
                <View style={styles.accountHeader}>
                    <View style={[styles.accountIcon, { backgroundColor: config.color + "15" }]}>
                        <MaterialIcons name={config.icon} size={20} color={config.color} />
                    </View>
                    <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{item.nombre_cuenta || config.text}</Text>
                        <Text style={styles.accountNumber}>****{item.numero_cuenta?.slice(-4)}</Text>
                    </View>
                    <View style={[styles.accountTypeBadge, { backgroundColor: config.color + "15" }]}>
                        <Text style={[styles.accountTypeText, { color: config.color }]}>{config.text}</Text>
                    </View>
                </View>
                <View style={styles.accountBalance}>
                    <Text style={styles.balanceLabel}>Balance</Text>
                    <Text style={[styles.balanceValue, { color: config.color }]}>
                        {formatBalance(item.balance)}
                    </Text>
                </View>
                <View style={styles.accountMeta}>
                    <View style={styles.metaItem}>
                        <MaterialIcons name="calendar-today" size={12} color={COLORS.secondary} />
                        <Text style={styles.metaText}>{item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString("es-GT") : "—"}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <MaterialIcons name="flag" size={12} color={item.estado === "activa" ? COLORS.success : COLORS.error} />
                        <Text style={[styles.metaText, { color: item.estado === "activa" ? COLORS.success : COLORS.error }]}>
                            {item.estado || "Sin estado"}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && !accounts.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Cuentas</Text>
                <Text style={styles.headerSubtitle}>Gestiona tus cuentas bancarias</Text>
            </View>

            {/* RESUMEN */}
            <View style={styles.summary}>
                <View style={styles.summaryIconContainer}>
                    <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.primary} />
                </View>
                <View>
                    <Text style={styles.summaryLabel}>Balance total</Text>
                    <Text style={styles.summaryValue}>{formatBalance(totalBalance)}</Text>
                </View>
            </View>

            {error && !accounts.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState message="No tienes cuentas registradas" />}
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
        alignItems: "center",
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.lg,
        marginTop: -12,
        borderRadius: 16,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.md,
    },
    summaryIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary + "15",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
        marginTop: 2,
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.md,
    },
    accountCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    accountHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    accountIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    accountInfo: {
        flex: 1,
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
    accountTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    accountTypeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    accountBalance: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    balanceLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.secondary,
    },
    balanceValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
    },
    accountMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: COLORS.secondary,
    },
});

export default AccountsScreen;
