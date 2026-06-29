import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useShoppings } from "../hooks/useShoppings.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const categoryConfig = {
    Seguros: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    Prestamos: { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    Inversiones: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    Ahorro: { color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
    General: { color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
};

const statusConfig = {
    COMPLETADO: { text: "Completado", color: "#10b981", icon: "check-circle" },
    ANULADO: { text: "Anulado", color: "#ef4444", icon: "cancel" },
};

const formatPrice = (price) =>
    Number(price) === 0 ? "Gratis" : `Q ${Number(price).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const ShoppingsScreen = () => {
    const { allShoppings, loading, error } = useShoppings();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("TODOS");
    const [expandedId, setExpandedId] = useState(null);

    const totalSpent = allShoppings
        .filter((s) => s.estado === "COMPLETADO")
        .reduce((sum, s) => sum + Number(s.monto || 0), 0);

    const filtered = allShoppings.filter((s) => {
        const productName = s.product?.name || s.producto?.name || "";
        const productCat = s.product?.category || s.producto?.category || "";
        const matchSearch =
            productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productCat.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id?.toString().includes(searchTerm);
        const matchStatus = selectedStatus === "TODOS" || s.estado === selectedStatus;
        return matchSearch && matchStatus;
    });

    const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

    const renderItem = ({ item }) => {
        const productName = item.product?.name || item.producto?.name || "Producto";
        const productCat = item.product?.category || item.producto?.category || "General";
        const cat = categoryConfig[productCat] || categoryConfig.General;
        const status = statusConfig[item.estado] || statusConfig.COMPLETADO;
        const isExpanded = expandedId === item.id;

        return (
            <View style={styles.shoppingCard}>
                <TouchableOpacity
                    style={styles.shoppingHeader}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={styles.shoppingLeft}>
                        <View style={[styles.shoppingIcon, { backgroundColor: cat.bg }]}>
                            <MaterialIcons name="shopping-bag" size={18} color={cat.color} />
                        </View>
                        <View style={styles.shoppingInfo}>
                            <View style={styles.shoppingTitleRow}>
                                <Text style={styles.shoppingName}>{productName}</Text>
                                <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
                                    <Text style={[styles.categoryText, { color: cat.color }]}>{productCat}</Text>
                                </View>
                            </View>
                            <Text style={styles.shoppingDate}>
                                {formatDate(item.fecha || item.createdAt)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.shoppingRight}>
                        <Text style={styles.shoppingPrice}>{formatPrice(item.monto)}</Text>
                        <View style={styles.statusRow}>
                            <MaterialIcons name={status.icon} size={10} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.shoppingDetails}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Fecha de adquisicion</Text>
                                <Text style={styles.detailValue}>{formatDate(item.fecha || item.createdAt)}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Estado</Text>
                                <View style={styles.statusBadgeRow}>
                                    <MaterialIcons name={status.icon} size={12} color={status.color} />
                                    <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.text}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.shoppingFooter}>
                            <Text style={styles.footerText}>NovaPay Secure Transaction</Text>
                            {item.estado === "COMPLETADO" && (
                                <Text style={styles.footerActive}>Producto activo</Text>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (loading && !allShoppings.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Adquisiciones</Text>
                <Text style={styles.headerSubtitle}>Historial de servicios contratados en NovaPay</Text>
            </View>

            {/* BANNER */}
            <View style={styles.banner}>
                <View style={styles.bannerIcon}>
                    <MaterialIcons name="trending-up" size={20} color="#6366f1" />
                </View>
                <View style={styles.bannerInfo}>
                    <Text style={styles.bannerLabel}>Inversion Total</Text>
                    <Text style={styles.bannerValue}>{loading ? "—" : formatPrice(totalSpent)}</Text>
                </View>
                <View style={styles.bannerRight}>
                    <Text style={styles.bannerCount}>{allShoppings.length} solicitudes</Text>
                    <Text style={styles.bannerSub}>en total</Text>
                </View>
            </View>

            {/* FILTROS */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={18} color={COLORS.secondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por producto o categoria..."
                    placeholderTextColor={COLORS.secondary}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <FlatList
                horizontal
                data={["TODOS", "COMPLETADO", "ANULADO"]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                style={styles.statusList}
                contentContainerStyle={styles.statusContent}
                renderItem={({ item: status }) => {
                    const isSelected = selectedStatus === status;
                    return (
                        <TouchableOpacity
                            style={[styles.statusTab, isSelected && styles.statusTabActive]}
                            onPress={() => setSelectedStatus(status)}
                        >
                            <Text style={[styles.statusTabText, isSelected && styles.statusTabTextActive]}>
                                {status.toLowerCase()}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* LISTA */}
            {error && !allShoppings.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState message="No hay adquisiciones" />}
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
    banner: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: SPACING.lg,
        marginTop: -12,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: "#6366f1" + "20",
        gap: 10,
    },
    bannerIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#6366f1" + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    bannerInfo: {
        flex: 1,
    },
    bannerLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    bannerValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
    },
    bannerRight: {
        alignItems: "flex-end",
    },
    bannerCount: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },
    bannerSub: {
        fontSize: 10,
        color: COLORS.secondary,
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
    statusList: {
        marginTop: SPACING.sm,
    },
    statusContent: {
        paddingHorizontal: SPACING.lg,
        gap: 8,
    },
    statusTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusTabActive: {
        backgroundColor: "#6366f1" + "15",
        borderColor: "#6366f1" + "30",
    },
    statusTabText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.secondary,
        textTransform: "capitalize",
    },
    statusTabTextActive: {
        color: "#818cf8",
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.sm,
        gap: 10,
    },
    shoppingCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    shoppingHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: SPACING.md,
    },
    shoppingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    shoppingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    shoppingInfo: {
        flex: 1,
    },
    shoppingTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    shoppingName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
        flex: 1,
    },
    categoryBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: "700",
    },
    shoppingDate: {
        fontSize: 11,
        color: COLORS.secondary,
        marginTop: 2,
    },
    shoppingRight: {
        alignItems: "flex-end",
        gap: 2,
    },
    shoppingPrice: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        color: COLORS.text,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "600",
    },
    shoppingDetails: {
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
    detailValue: {
        fontSize: 12,
        color: COLORS.text,
    },
    statusBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    shoppingFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        borderStyle: "dashed",
    },
    footerText: {
        fontSize: 10,
        color: COLORS.secondary,
    },
    footerActive: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: "600",
    },
});

export default ShoppingsScreen;
