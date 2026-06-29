import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { usePassbooks } from "../hooks/usePassbooks.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    SHADOWS,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const tipoLibretaConfig = {
    AHORRO: { color: "#10b981", label: "Ahorro" },
    CORRIENTE: { color: "#6366f1", label: "Corriente" },
    PLAZO_FIJO: { color: "#f59e0b", label: "Plazo Fijo" },
    INFANTIL: { color: "#ec4899", label: "Infantil" },
};

const cuentaConfig = {
    MONETARIA: { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    AHORRO: { color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
    AHORRO_PROGRAMADO: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
};

const maskLibreta = (n) => n ? `**** **** ${n.slice(-4)}` : "****";
const formatDate = (date) => date
    ? new Date(date).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })
    : "—";

const PassbooksScreen = () => {
    const { accountsWithPassbooks, loading, error } = usePassbooks();
    const [showNumbers, setShowNumbers] = useState({});
    const [expanded, setExpanded] = useState({});

    const toggleNumber = (accountId) => {
        setShowNumbers((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
    };

    const toggleAccount = (accountId) => {
        setExpanded((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
    };

    const totalLibretas = accountsWithPassbooks.filter((a) => a.passbook).length;

    if (loading && !accountsWithPassbooks.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Libretas</Text>
                <Text style={styles.headerSubtitle}>
                    {loading
                        ? "Cargando..."
                        : `${totalLibretas} libreta${totalLibretas !== 1 ? "s" : ""} en ${accountsWithPassbooks.length} cuenta${accountsWithPassbooks.length !== 1 ? "s" : ""}`}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {accountsWithPassbooks.map((account) => {
                    const tipo = account.tipo || account.tipo_cuenta || "MONETARIA";
                    const cuenta = cuentaConfig[tipo] || cuentaConfig.MONETARIA;
                    const isExpanded = expanded[account.id];
                    const passbook = account.passbook;
                    const tipoPb = passbook ? (tipoLibretaConfig[passbook.tipo_libreta] || tipoLibretaConfig.AHORRO) : null;
                    const showNumber = showNumbers[account.id] || false;

                    return (
                        <View key={account.id} style={styles.accountSection}>
                            <TouchableOpacity
                                style={styles.accountHeader}
                                onPress={() => toggleAccount(account.id)}
                            >
                                <View style={[styles.accountIcon, { backgroundColor: cuenta.bg }]}>
                                    <MaterialIcons name="menu-book" size={18} color={cuenta.color} />
                                </View>
                                <View style={styles.accountInfo}>
                                    <Text style={styles.accountName}>{account.nombre_cuenta || tipo}</Text>
                                    <Text style={styles.accountNumber}>**** {account.numero_cuenta?.slice(-4)}</Text>
                                </View>
                                <View style={styles.accountRight}>
                                    <Text style={styles.statusText}>
                                        {passbook ? "1 libreta" : "Sin libreta"}
                                    </Text>
                                    <MaterialIcons
                                        name={isExpanded ? "expand-less" : "expand-more"}
                                        size={20}
                                        color={COLORS.secondary}
                                    />
                                </View>
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.contentContainer}>
                                    {!passbook ? (
                                        <View style={styles.emptyPassbook}>
                                            <MaterialIcons name="menu-book" size={28} color={COLORS.secondary} />
                                            <Text style={styles.emptyText}>Sin libreta asignada</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.passbookCard, { backgroundColor: tipoPb.color }]}>
                                            <View style={styles.passbookDecor1} />
                                            <View style={styles.passbookDecor2} />

                                            <View style={styles.passbookTop}>
                                                <View>
                                                    <Text style={styles.passbookBrand}>NovaPay</Text>
                                                    <Text style={styles.passbookType}>Libreta {tipoPb.label}</Text>
                                                </View>
                                                <View style={styles.passbookBadges}>
                                                    <View style={styles.passbookBadge}>
                                                        <MaterialIcons name="check-circle" size={12} color="rgba(255,255,255,0.8)" />
                                                        <Text style={styles.passbookBadgeText}>{passbook.estado || "ACTIVA"}</Text>
                                                    </View>
                                                    <View style={styles.passbookBadge}>
                                                        <Text style={styles.passbookBadgeText}>{tipoPb.label}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.passbookNumber}>
                                                <Text style={styles.passbookLabel}>Numero de libreta</Text>
                                                <View style={styles.passbookNumberRow}>
                                                    <MaterialIcons name="tag" size={14} color="rgba(255,255,255,0.5)" />
                                                    <Text style={styles.passbookNumberText}>
                                                        {showNumber ? passbook.numero_libreta : maskLibreta(passbook.numero_libreta)}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => toggleNumber(account.id)}>
                                                        <MaterialIcons
                                                            name={showNumber ? "visibility-off" : "visibility"}
                                                            size={14}
                                                            color="rgba(255,255,255,0.5)"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View style={styles.passbookDate}>
                                                <MaterialIcons name="calendar-today" size={12} color="rgba(255,255,255,0.5)" />
                                                <View>
                                                    <Text style={styles.passbookLabel}>Emitida el</Text>
                                                    <Text style={styles.passbookDateText}>
                                                        {formatDate(passbook.fecha_emision || passbook.createdAt)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}

                {accountsWithPassbooks.length === 0 && !loading && (
                    <EmptyState message="No tienes cuentas registradas" />
                )}
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
        gap: 12,
    },
    accountSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    accountHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: SPACING.md,
    },
    accountIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
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
    },
    accountRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        color: COLORS.secondary,
    },
    contentContainer: {
        padding: SPACING.md,
        paddingTop: 0,
    },
    emptyPassbook: {
        alignItems: "center",
        paddingVertical: 24,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: "dashed",
    },
    emptyText: {
        fontSize: 12,
        color: COLORS.secondary,
        marginTop: 6,
    },
    passbookCard: {
        borderRadius: 16,
        padding: 20,
        overflow: "hidden",
    },
    passbookDecor1: {
        position: "absolute",
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    passbookDecor2: {
        position: "absolute",
        bottom: -32,
        left: -32,
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    passbookTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    passbookBrand: {
        fontSize: 10,
        fontWeight: "700",
        color: "rgba(255,255,255,0.6)",
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    passbookType: {
        fontSize: 12,
        color: "rgba(255,255,255,0.9)",
        fontWeight: "500",
        marginTop: 2,
    },
    passbookBadges: {
        gap: 4,
    },
    passbookBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    passbookBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "rgba(255,255,255,0.8)",
    },
    passbookNumber: {
        marginBottom: 16,
    },
    passbookLabel: {
        fontSize: 9,
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    passbookNumberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    passbookNumberText: {
        fontSize: 15,
        fontFamily: "monospace",
        color: "#fff",
        letterSpacing: 1.2,
        fontWeight: "600",
    },
    passbookDate: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    passbookDateText: {
        fontSize: 12,
        color: "#fff",
        fontWeight: "500",
    },
});

export default PassbooksScreen;
