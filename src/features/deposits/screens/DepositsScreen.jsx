import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTransactions } from "../../transactions/hooks/useTransactions.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    SHADOWS,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const formatBalance = (amount) =>
    `Q ${Number(amount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" });

const formatTime = (date) =>
    new Date(date).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

const DepositsScreen = () => {
    const { transactions, loading, error, getMyTransactions } = useTransactions();
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    const onRefresh = useCallback(() => {
        getMyTransactions();
    }, [getMyTransactions]);

    const deposits = transactions.filter((t) => t.type === "deposit");

    const filtered = deposits.filter(
        (d) =>
            searchTerm === "" ||
            d.id?.toString().includes(searchTerm) ||
            d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.amount?.toString().includes(searchTerm)
    );

    const totalMonto = filtered.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

    const renderItem = ({ item }) => {
        const isExpanded = expandedId === item.id;
        return (
            <View style={styles.depositCard}>
                <TouchableOpacity
                    style={styles.depositHeader}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={styles.depositLeft}>
                        <View style={styles.depositIcon}>
                            <MaterialIcons name="arrow-downward" size={18} color={COLORS.success} />
                        </View>
                        <View style={styles.depositInfo}>
                            <View style={styles.depositTitleRow}>
                                <Text style={styles.depositDesc} numberOfLines={1}>
                                    {item.description || "Deposito recibido"}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>COMPLETADO</Text>
                                </View>
                            </View>
                            <Text style={styles.depositDate}>
                                {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.depositRight}>
                        <Text style={styles.depositAmount}>+{formatBalance(item.amount)}</Text>
                        <MaterialIcons
                            name={isExpanded ? "expand-less" : "expand-more"}
                            size={18}
                            color={COLORS.secondary}
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.depositDetails}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Fecha y hora</Text>
                                <View style={styles.detailValueRow}>
                                    <MaterialIcons name="calendar-today" size={12} color={COLORS.secondary} />
                                    <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Monto depositado</Text>
                                <View style={styles.detailValueRow}>
                                    <MaterialIcons name="arrow-downward" size={12} color={COLORS.success} />
                                    <Text style={[styles.detailValue, { color: COLORS.success, fontWeight: "700" }]}>
                                        {formatBalance(item.amount)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (loading && !transactions.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Depositos</Text>
                <Text style={styles.headerSubtitle}>Historial de depositos recibidos en tus cuentas</Text>
            </View>

            {/* RESUMEN */}
            <View style={styles.summary}>
                <View style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: COLORS.success + "15" }]}>
                        <MaterialIcons name="arrow-downward" size={18} color={COLORS.success} />
                    </View>
                    <Text style={styles.summaryValue}>{loading ? "—" : filtered.length}</Text>
                    <Text style={styles.summaryLabel}>Depositos</Text>
                </View>
                <View style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: COLORS.success + "15" }]}>
                        <MaterialIcons name="check-circle" size={18} color={COLORS.success} />
                    </View>
                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                        {loading ? "—" : formatBalance(totalMonto)}
                    </Text>
                    <Text style={styles.summaryLabel}>Total depositado</Text>
                </View>
            </View>

            {/* BUSCADOR */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={18} color={COLORS.secondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por ID, descripcion o monto..."
                    placeholderTextColor={COLORS.secondary}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
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
                    ListEmptyComponent={<EmptyState message="No se encontraron depositos" />}
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
        paddingHorizontal: SPACING.lg,
        marginTop: -12,
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    summaryIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: COLORS.text,
    },
    summaryLabel: {
        fontSize: 10,
        color: COLORS.secondary,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.sm,
        gap: 8,
    },
    depositCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    depositHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: SPACING.md,
    },
    depositLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    depositIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.success + "15",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    depositInfo: {
        flex: 1,
    },
    depositTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    depositDesc: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: COLORS.success + "15",
    },
    statusText: {
        fontSize: 9,
        fontWeight: "700",
        color: COLORS.success,
    },
    depositDate: {
        fontSize: 11,
        color: COLORS.secondary,
        marginTop: 2,
    },
    depositRight: {
        alignItems: "flex-end",
        gap: 2,
    },
    depositAmount: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        color: COLORS.success,
    },
    depositDetails: {
        padding: SPACING.md,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    detailRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    detailItem: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    detailValue: {
        fontSize: 12,
        color: COLORS.text,
    },
});

export default DepositsScreen;
