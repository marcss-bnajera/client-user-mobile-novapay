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
import { useProducts } from "../hooks/useProducts.js";
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

const formatPrice = (price) =>
    Number(price) === 0 ? "Gratis" : `Q ${Number(price).toLocaleString("es-GT", { minimumFractionDigits: 2 })} / mes`;

const ProductsScreen = () => {
    const { products, loading, error } = useProducts();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [expandedId, setExpandedId] = useState(null);

    const activeProducts = products.filter((p) => p.state === "ACTIVE" || p.estado === "ACTIVE");
    const categories = ["Todos", ...new Set(activeProducts.map((p) => p.category))].filter(Boolean);

    const filtered = activeProducts.filter((p) => {
        const matchSearch =
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === "Todos" || p.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

    const renderItem = ({ item }) => {
        const c = categoryConfig[item.category] || categoryConfig.General;
        const isExpanded = expandedId === item.id;
        const isFree = Number(item.price) === 0;

        return (
            <View style={styles.productCard}>
                <TouchableOpacity
                    style={styles.productHeader}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={styles.productLeft}>
                        <View style={[styles.productIcon, { backgroundColor: c.bg }]}>
                            <MaterialIcons name="inventory-2" size={18} color={c.color} />
                        </View>
                        <View style={styles.productInfo}>
                            <View style={styles.productTitleRow}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <View style={[styles.categoryBadge, { backgroundColor: c.bg }]}>
                                    <MaterialIcons name="label" size={10} color={c.color} />
                                    <Text style={[styles.categoryText, { color: c.color }]}>{item.category}</Text>
                                </View>
                            </View>
                            <Text style={styles.productDesc} numberOfLines={1}>
                                {item.description?.slice(0, 60)}...
                            </Text>
                        </View>
                    </View>
                    <View style={styles.productRight}>
                        <Text style={[styles.productPrice, { color: isFree ? COLORS.success : COLORS.text }]}>
                            {formatPrice(item.price)}
                        </Text>
                        <MaterialIcons
                            name={isExpanded ? "expand-less" : "expand-more"}
                            size={18}
                            color={COLORS.secondary}
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.productDetails}>
                        <Text style={styles.detailLabel}>Descripcion</Text>
                        <Text style={styles.detailText}>{item.description}</Text>
                        <View style={styles.priceDetail}>
                            <Text style={styles.detailLabel}>Precio</Text>
                            <Text style={[styles.priceValue, { color: isFree ? COLORS.success : COLORS.text }]}>
                                {formatPrice(item.price)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (loading && !products.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Productos NovaPay</Text>
                <Text style={styles.headerSubtitle}>Explora los servicios financieros disponibles</Text>
            </View>

            {/* BANNER */}
            <View style={styles.banner}>
                <View style={styles.bannerIcon}>
                    <MaterialIcons name="auto-awesome" size={20} color={COLORS.success} />
                </View>
                <View>
                    <Text style={styles.bannerValue}>
                        {loading ? "—" : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
                    </Text>
                    <Text style={styles.bannerLabel}>Productos activos disponibles</Text>
                </View>
            </View>

            {/* FILTROS */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={18} color={COLORS.secondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar producto..."
                    placeholderTextColor={COLORS.secondary}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
                contentContainerStyle={styles.categoryContent}
                renderItem={({ item: cat }) => {
                    const isSelected = selectedCategory === cat;
                    const c = cat === "Todos"
                        ? { color: COLORS.success, bg: COLORS.success + "15" }
                        : (categoryConfig[cat] || categoryConfig.General);
                    return (
                        <TouchableOpacity
                            style={[styles.categoryTab, isSelected && { backgroundColor: c.bg, borderColor: c.color + "30" }]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.categoryTabText, isSelected && { color: c.color }]}>{cat}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* LISTA */}
            {error && !products.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState message="No se encontraron productos" />}
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
        borderColor: COLORS.success + "20",
        gap: 10,
    },
    bannerIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.success + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    bannerValue: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        color: COLORS.text,
    },
    bannerLabel: {
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
    categoryList: {
        marginTop: SPACING.sm,
    },
    categoryContent: {
        paddingHorizontal: SPACING.lg,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryTabText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.secondary,
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.sm,
        gap: 10,
    },
    productCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    productHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: SPACING.md,
    },
    productLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    productIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    productInfo: {
        flex: 1,
    },
    productTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    productName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
        flex: 1,
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: "700",
    },
    productDesc: {
        fontSize: 11,
        color: COLORS.secondary,
        marginTop: 2,
    },
    productRight: {
        alignItems: "flex-end",
        gap: 2,
    },
    productPrice: {
        fontSize: 12,
        fontWeight: "700",
    },
    productDetails: {
        padding: SPACING.md,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailText: {
        fontSize: 12,
        color: COLORS.textLight,
        lineHeight: 18,
    },
    priceDetail: {
        marginTop: 12,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
    },
    priceValue: {
        fontSize: 16,
        fontWeight: "700",
    },
});

export default ProductsScreen;
