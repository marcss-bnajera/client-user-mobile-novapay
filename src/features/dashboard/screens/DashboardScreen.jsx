import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUsers } from "../../users/hooks/useUsers.js";
import { useAccounts } from "../../accounts/hooks/useAccounts.js";
import { useAuthStore } from "../../../shared/store/authStore.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    SHADOWS,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner } from "../../../shared/components/Common.jsx";

const DashboardScreen = ({ navigation }) => {
    const { user, loading: userLoading } = useUsers();
    const { accounts, loading: accountsLoading } = useAccounts();
    const logout = useAuthStore((state) => state.logout);

    const loading = userLoading || accountsLoading;
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

    const formatBalance = (balance) => {
        return `Q ${Number(balance || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
    };

    const accesos = [
        { label: "Transacciones", icon: "receipt-long", screen: "Transactions", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
        { label: "Transferir", icon: "send", screen: "Transfers", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
        { label: "Mis Cuentas", icon: "account-balance-wallet", screen: "Accounts", color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
        { label: "Mi Perfil", icon: "person", screen: "Users", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
        { label: "Tarjetas", icon: "credit-card", screen: "Cards", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
        { label: "Libretas", icon: "menu-book", screen: "Passbooks", color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
        { label: "Depositos", icon: "arrow-downward", screen: "Deposits", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
        { label: "Productos", icon: "inventory-2", screen: "Products", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
        { label: "Adquisiciones", icon: "shopping-bag", screen: "Shoppings", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
        { label: "Favoritos", icon: "star", screen: "Favorites", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
        { label: "Divisas", icon: "swap-horiz", screen: "Currencies", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    ];

    if (loading && !user) return <LoadingSpinner />;

    return (
        <ScrollView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerInner}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.nombre?.[0]}{user?.apellido?.[0]}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.welcomeText}>Bienvenido de vuelta</Text>
                        <Text style={styles.userName}>
                            {user?.nombre} {user?.apellido}
                        </Text>
                        <Text style={styles.userHandle}>@{user?.username}</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <MaterialIcons name="shield" size={14} color={COLORS.success} />
                        <Text style={styles.roleText}>Cliente NovaPay</Text>
                    </View>
                </View>
            </View>

            {/* RESUMEN */}
            <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: COLORS.success + "15" }]}>
                        <MaterialIcons name="account-balance-wallet" size={20} color={COLORS.success} />
                    </View>
                    <Text style={styles.summaryValue}>
                        {loading ? "—" : accounts.length}
                    </Text>
                    <Text style={styles.summaryLabel}>Cuentas activas</Text>
                </View>
                <View style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: "#38bdf8" + "15" }]}>
                        <MaterialIcons name="trending-up" size={20} color="#38bdf8" />
                    </View>
                    <Text style={styles.summaryValue}>
                        {loading ? "—" : formatBalance(totalBalance)}
                    </Text>
                    <Text style={styles.summaryLabel}>Balance total</Text>
                </View>
                <View style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: "#8b5cf6" + "15" }]}>
                        <MaterialIcons name="person" size={20} color="#8b5cf6" />
                    </View>
                    <Text style={styles.summaryValue}>@{user?.username}</Text>
                    <Text style={styles.summaryLabel}>Mi perfil</Text>
                </View>
            </View>

            {/* ACCESOS RAPIDOS */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accesos rapidos</Text>
                <View style={styles.accesosGrid}>
                    {accesos.map((acceso) => (
                        <TouchableOpacity
                            key={acceso.label}
                            style={[styles.accesoCard, { backgroundColor: acceso.bg }]}
                            onPress={() => navigation.navigate(acceso.screen)}
                        >
                            <View style={styles.accesoIconContainer}>
                                <MaterialIcons name={acceso.icon} size={20} color={acceso.color} />
                            </View>
                            <Text style={styles.accesoLabel}>{acceso.label}</Text>
                            <MaterialIcons name="arrow-forward" size={14} color={COLORS.secondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* NOTIFICACION */}
            <View style={styles.notification}>
                <MaterialIcons name="notifications" size={16} color={COLORS.primary} />
                <Text style={styles.notificationText}>
                    Recuerda mantener tus datos actualizados. Puedes editar tu informacion desde{" "}
                    <Text style={styles.notificationLink}>Mi Perfil</Text>.
                </Text>
            </View>

            {/* CERRAR SESION */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <MaterialIcons name="logout" size={18} color={COLORS.error} />
                <Text style={styles.logoutText}>Cerrar sesion</Text>
            </TouchableOpacity>
        </ScrollView>
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
    headerInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "800",
        color: COLORS.primary,
    },
    headerInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 11,
        color: "rgba(255,255,255,0.5)",
    },
    userName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
    },
    userHandle: {
        fontSize: 12,
        color: COLORS.success,
        opacity: 0.8,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: "rgba(34,197,94,0.1)",
        borderWidth: 1,
        borderColor: "rgba(34,197,94,0.2)",
        gap: 4,
    },
    roleText: {
        fontSize: 10,
        fontWeight: "600",
        color: COLORS.success,
    },
    summaryGrid: {
        flexDirection: "row",
        paddingHorizontal: SPACING.lg,
        marginTop: -12,
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
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
    section: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: SPACING.sm,
    },
    accesosGrid: {
        gap: 8,
    },
    accesoCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    accesoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(0,0,0,0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    accesoLabel: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },
    notification: {
        flexDirection: "row",
        marginHorizontal: SPACING.lg,
        padding: SPACING.md,
        borderRadius: 14,
        backgroundColor: COLORS.primary + "08",
        borderWidth: 1,
        borderColor: COLORS.primary + "15",
        gap: 10,
        alignItems: "flex-start",
    },
    notificationText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.secondary,
        lineHeight: 18,
    },
    notificationLink: {
        color: COLORS.primary,
        fontWeight: "600",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        marginBottom: SPACING.xxl,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: COLORS.error + "10",
        borderWidth: 1,
        borderColor: COLORS.error + "20",
        gap: 8,
    },
    logoutText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.error,
    },
});

export default DashboardScreen;
