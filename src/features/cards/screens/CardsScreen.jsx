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
import { useCards } from "../hooks/useCards.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    SHADOWS,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const tipoConfig = {
    DEBITO: { color: "#10b981", label: "Debito" },
    CREDITO: { color: "#8b5cf6", label: "Credito" },
    PREPAGO: { color: "#f59e0b", label: "Prepago" },
    VIRTUAL: { color: "#38bdf8", label: "Virtual" },
};

const cuentaConfig = {
    MONETARIA: { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    AHORRO: { color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
    AHORRO_PROGRAMADO: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
};

const maskCard = (n) => n ? `**** **** **** ${n.slice(-4)}` : "**** **** **** ****";
const formatCard = (n) => n ? n.replace(/(.{4})/g, "$1 ").trim() : "";

const CardsScreen = () => {
    const { accountsWithCards, loading, error, getMyAccounts } = useCards();
    const [cardStates, setCardStates] = useState({});
    const [expanded, setExpanded] = useState({});

    const onRefresh = useCallback(() => {
        getMyAccounts();
    }, [getMyAccounts]);

    const toggleCard = (cardId, field) => {
        setCardStates((prev) => ({
            ...prev,
            [cardId]: { ...prev[cardId], [field]: !prev[cardId]?.[field] },
        }));
    };

    const toggleAccount = (accountId) => {
        setExpanded((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
    };

    const totalCards = accountsWithCards.reduce((sum, acc) => sum + acc.cards.length, 0);

    if (loading && !accountsWithCards.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Tarjetas</Text>
                <Text style={styles.headerSubtitle}>
                    {loading
                        ? "Cargando..."
                        : `${totalCards} tarjeta${totalCards !== 1 ? "s" : ""} en ${accountsWithCards.length} cuenta${accountsWithCards.length !== 1 ? "s" : ""}`}
                </Text>
            </View>

            {error && !accountsWithCards.length ? (
                <EmptyState message={error} />
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    contentContainerStyle={styles.scrollContent}
                >
                    {accountsWithCards.map((account) => {
                        const tipo = account.tipo || account.tipo_cuenta || "MONETARIA";
                        const cuenta = cuentaConfig[tipo] || cuentaConfig.MONETARIA;
                        const isExpanded = expanded[account.id];

                        return (
                            <View key={account.id} style={styles.accountSection}>
                                <TouchableOpacity
                                    style={styles.accountHeader}
                                    onPress={() => toggleAccount(account.id)}
                                >
                                    <View style={[styles.accountIcon, { backgroundColor: cuenta.bg }]}>
                                        <MaterialIcons name="credit-card" size={18} color={cuenta.color} />
                                    </View>
                                    <View style={styles.accountInfo}>
                                        <Text style={styles.accountName}>{account.nombre_cuenta || tipo}</Text>
                                        <Text style={styles.accountNumber}>**** {account.numero_cuenta?.slice(-4)}</Text>
                                    </View>
                                    <View style={styles.accountRight}>
                                        <Text style={styles.cardCount}>
                                            {account.cards.length} tarjeta{account.cards.length !== 1 ? "s" : ""}
                                        </Text>
                                        <MaterialIcons
                                            name={isExpanded ? "expand-less" : "expand-more"}
                                            size={20}
                                            color={COLORS.secondary}
                                        />
                                    </View>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.cardsContainer}>
                                        {account.cards.length === 0 ? (
                                            <View style={styles.emptyCards}>
                                                <MaterialIcons name="credit-card" size={28} color={COLORS.secondary} />
                                                <Text style={styles.emptyCardsText}>Sin tarjetas asignadas</Text>
                                            </View>
                                        ) : (
                                            account.cards.map((card) => {
                                                const showNumber = cardStates[card.id]?.showNumber || false;
                                                const showCvv = cardStates[card.id]?.showCvv || false;
                                                const tipoTarjeta = card.tipo_tarjeta || "DEBITO";
                                                const tc = tipoConfig[tipoTarjeta] || tipoConfig.DEBITO;

                                                return (
                                                    <View
                                                        key={card.id}
                                                        style={[styles.cardVisual, { backgroundColor: tc.color }]}
                                                    >
                                                        <View style={styles.cardDecor1} />
                                                        <View style={styles.cardDecor2} />

                                                        <View style={styles.cardTop}>
                                                            <View>
                                                                <Text style={styles.cardBrand}>NovaPay</Text>
                                                                <Text style={styles.cardType}>Tarjeta {tc.label}</Text>
                                                            </View>
                                                            <MaterialIcons name="wifi" size={18} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: "90deg" }] }} />
                                                        </View>

                                                        <View style={styles.cardMiddle}>
                                                            <Text style={styles.cardNumber}>
                                                                {showNumber ? formatCard(card.numero_tarjeta) : maskCard(card.numero_tarjeta)}
                                                            </Text>
                                                            <TouchableOpacity onPress={() => toggleCard(card.id, "showNumber")}>
                                                                <MaterialIcons
                                                                    name={showNumber ? "visibility-off" : "visibility"}
                                                                    size={16}
                                                                    color="rgba(255,255,255,0.5)"
                                                                />
                                                            </TouchableOpacity>
                                                        </View>

                                                        <View style={styles.cardBottom}>
                                                            <View style={styles.cardBottomLeft}>
                                                                <View>
                                                                    <Text style={styles.cardLabel}>Expira</Text>
                                                                    <Text style={styles.cardValue}>{card.fecha_expiracion || "—"}</Text>
                                                                </View>
                                                                <View>
                                                                    <Text style={styles.cardLabel}>CVV</Text>
                                                                    <View style={styles.cvvRow}>
                                                                        <Text style={styles.cardValue}>{showCvv ? card.cvv : "•••"}</Text>
                                                                        <TouchableOpacity onPress={() => toggleCard(card.id, "showCvv")}>
                                                                            <MaterialIcons
                                                                                name={showCvv ? "visibility-off" : "visibility"}
                                                                                size={12}
                                                                                color="rgba(255,255,255,0.5)"
                                                                            />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <View style={styles.cardBadges}>
                                                                <View style={styles.cardBadge}>
                                                                    <Text style={styles.cardBadgeText}>{tc.label}</Text>
                                                                </View>
                                                                <View style={styles.cardBadge}>
                                                                    <Text style={styles.cardBadgeText}>{card.estado || "ACTIVA"}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            })
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {accountsWithCards.length === 0 && !loading && (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="credit-card" size={40} color={COLORS.secondary} />
                            <Text style={styles.emptyText}>No tienes cuentas vinculadas</Text>
                        </View>
                    )}
                </ScrollView>
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
    cardCount: {
        fontSize: 11,
        color: COLORS.secondary,
    },
    cardsContainer: {
        padding: SPACING.md,
        paddingTop: 0,
        gap: 12,
    },
    emptyCards: {
        alignItems: "center",
        paddingVertical: 24,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: "dashed",
    },
    emptyCardsText: {
        fontSize: 12,
        color: COLORS.secondary,
        marginTop: 6,
    },
    cardVisual: {
        borderRadius: 16,
        padding: 20,
        overflow: "hidden",
    },
    cardDecor1: {
        position: "absolute",
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    cardDecor2: {
        position: "absolute",
        bottom: -24,
        left: -24,
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    cardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    cardBrand: {
        fontSize: 10,
        fontWeight: "700",
        color: "rgba(255,255,255,0.6)",
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    cardType: {
        fontSize: 11,
        color: "rgba(255,255,255,0.9)",
        fontWeight: "500",
    },
    cardMiddle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    cardNumber: {
        fontSize: 14,
        fontFamily: "monospace",
        color: "#fff",
        letterSpacing: 1.2,
        fontWeight: "500",
    },
    cardBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    cardBottomLeft: {
        flexDirection: "row",
        gap: 20,
    },
    cardLabel: {
        fontSize: 9,
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 13,
        fontFamily: "monospace",
        color: "#fff",
        fontWeight: "600",
    },
    cvvRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cardBadges: {
        gap: 4,
    },
    cardBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    cardBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "rgba(255,255,255,0.8)",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 8,
    },
});

export default CardsScreen;
