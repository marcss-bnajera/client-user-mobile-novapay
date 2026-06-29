import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUsers } from "../hooks/useUsers.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const InfoField = ({ iconName, label, value }) => (
    <View style={styles.infoField}>
        <Text style={styles.infoFieldLabel}>{label}</Text>
        <View style={styles.infoFieldInput}>
            <MaterialIcons name={iconName} size={16} color={COLORS.secondary} style={styles.infoFieldIcon} />
            <Text style={styles.infoFieldValue}>{value || "—"}</Text>
        </View>
    </View>
);

const SectionTitle = ({ children, subtitle }) => (
    <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{children}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
);

const UsersScreen = ({ navigation }) => {
    const { user, loading, error, getProfile, updateProfile } = useUsers();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const onRefresh = React.useCallback(() => {
        getProfile();
    }, [getProfile]);

    const openEditModal = () => {
        setFormData({
            nombre: user?.nombre || "",
            apellido: user?.apellido || "",
            email: user?.email || "",
            telefono: user?.telefono || "",
            direccion: user?.direccion || "",
            nombre_trabajo: user?.nombre_trabajo || "",
            ingresos_mensuales: user?.ingresos_mensuales || "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.nombre?.trim() || !formData.apellido?.trim()) {
            Alert.alert("Error", "Nombre y apellido son obligatorios");
            return;
        }
        if (formData.telefono && !/^\d{8}$/.test(formData.telefono)) {
            Alert.alert("Error", "El telefono debe tener 8 digitos");
            return;
        }
        if (formData.ingresos_mensuales && (isNaN(formData.ingresos_mensuales) || Number(formData.ingresos_mensuales) <= 0)) {
            Alert.alert("Error", "Ingresa un monto valido para ingresos");
            return;
        }

        try {
            setSaving(true);
            await updateProfile(formData);
            setShowModal(false);
            Alert.alert("Exito", "Perfil actualizado correctamente");
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Error al actualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (field, value) => {
        let sanitized = value;
        if (field === "nombre" || field === "apellido" || field === "nombre_trabajo") {
            sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
        }
        if (field === "telefono") {
            sanitized = value.replace(/[^0-9]/g, "").slice(0, 8);
        }
        if (field === "ingresos_mensuales") {
            sanitized = value.replace(/[^0-9.]/g, "");
        }
        setFormData((prev) => ({ ...prev, [field]: sanitized }));
    };

    if (loading && !user) return <LoadingSpinner />;
    if (error && !user) return <EmptyState message={error} />;
    if (!user) return <EmptyState message="No se pudo cargar el perfil" />;

    const initials = `${user.nombre?.[0] || ""}${user.apellido?.[0] || ""}`;
    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("es-GT", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerInner}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                            <View style={styles.avatarStatus} />
                        </View>

                        <View style={styles.headerInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>
                                    {user.nombre} {user.apellido}
                                </Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Activo</Text>
                                </View>
                            </View>
                            <Text style={styles.userHandle}>@{user.username}</Text>
                            <View style={styles.metaRow}>
                                <MaterialIcons name="shield" size={12} color={COLORS.primary} />
                                <Text style={styles.metaText}>Cliente NovaPay</Text>
                                <MaterialIcons name="calendar-today" size={12} color={COLORS.primary} style={{ marginLeft: 12 }} />
                                <Text style={styles.metaText}>Miembro desde {joinDate}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                            <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* BODY */}
                <View style={styles.body}>
                    {/* Informacion personal */}
                    <SectionTitle>Informacion personal</SectionTitle>
                    <View style={styles.fieldsGrid}>
                        <InfoField iconName="person" label="Nombre" value={user.nombre} />
                        <InfoField iconName="person" label="Apellido" value={user.apellido} />
                        <InfoField iconName="email" label="Correo" value={user.email} />
                        <InfoField iconName="phone" label="Telefono" value={user.telefono} />
                        <InfoField iconName="location-on" label="Direccion" value={user.direccion} />
                    </View>

                    <View style={styles.divider} />

                    {/* Informacion laboral */}
                    <SectionTitle>Informacion laboral</SectionTitle>
                    <View style={styles.fieldsGrid}>
                        <InfoField iconName="work" label="Lugar de trabajo" value={user.nombre_trabajo} />
                        <InfoField
                            attachMoney
                            label="Ingresos mensuales"
                            value={
                                user.ingresos_mensuales
                                    ? `Q ${Number(user.ingresos_mensuales).toLocaleString("es-GT", {
                                          minimumFractionDigits: 2,
                                      })}`
                                    : "—"
                            }
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Datos de identificacion */}
                    <SectionTitle subtitle="Estos datos no pueden ser modificados.">
                        Datos de identificacion
                    </SectionTitle>
                    <View style={styles.fieldsGrid}>
                        <InfoField iconName="credit-card" label="DPI" value={user.dpi} />
                        <InfoField iconName="credit-card" label="NIT" value={user.nit} />
                        <InfoField iconName="person" label="Username" value={user.username} />
                    </View>
                </View>
            </ScrollView>

            {/* MODAL EDITAR */}
            <Modal visible={showModal} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderLeft}>
                                <View style={styles.modalIcon}>
                                    <MaterialIcons name="person" size={18} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>Editar perfil</Text>
                                    <Text style={styles.modalSubtitle}>Actualiza tu informacion personal</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
                                <MaterialIcons name="close" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                            <Text style={styles.modalSectionLabel}>Informacion personal</Text>
                            {[
                                { key: "nombre", label: "Nombre", placeholder: "Tu nombre", icon: "person" },
                                { key: "apellido", label: "Apellido", placeholder: "Tu apellido", icon: "person" },
                                { key: "email", label: "Correo", placeholder: "correo@ejemplo.com", icon: "email", keyboardType: "email-address" },
                                { key: "telefono", label: "Telefono", placeholder: "55551234", icon: "phone", keyboardType: "numeric" },
                                { key: "direccion", label: "Direccion", placeholder: "Tu direccion", icon: "location-on" },
                            ].map((field) => (
                                <View key={field.key} style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>{field.label}</Text>
                                    <View style={styles.modalInputContainer}>
                                        <MaterialIcons name={field.icon} size={16} color={COLORS.secondary} style={styles.modalInputIcon} />
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder={field.placeholder}
                                            placeholderTextColor={COLORS.secondary}
                                            value={formData[field.key]}
                                            onChangeText={(v) => handleFieldChange(field.key, v)}
                                            keyboardType={field.keyboardType || "default"}
                                        />
                                    </View>
                                </View>
                            ))}

                            <View style={styles.modalDivider} />

                            <Text style={styles.modalSectionLabel}>Informacion laboral</Text>
                            {[
                                { key: "nombre_trabajo", label: "Lugar de trabajo", placeholder: "Empresa o trabajo", icon: "work" },
                                { key: "ingresos_mensuales", label: "Ingresos mensuales", placeholder: "0.00", icon: "attach-money", keyboardType: "numeric" },
                            ].map((field) => (
                                <View key={field.key} style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>{field.label}</Text>
                                    <View style={styles.modalInputContainer}>
                                        <MaterialIcons name={field.icon} size={16} color={COLORS.secondary} style={styles.modalInputIcon} />
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder={field.placeholder}
                                            placeholderTextColor={COLORS.secondary}
                                            value={formData[field.key]}
                                            onChangeText={(v) => handleFieldChange(field.key, v)}
                                            keyboardType={field.keyboardType || "default"}
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSaveButton, saving && styles.modalSaveButtonDisabled]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                <MaterialIcons name="check" size={16} color="#fff" />
                                <Text style={styles.modalSaveText}>
                                    {saving ? "Guardando..." : "Guardar cambios"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Header
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
        position: "relative",
        marginRight: SPACING.md,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: "800",
        color: COLORS.primary,
    },
    avatarStatus: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    userName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
    },
    badge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: "rgba(34,197,94,0.15)",
        borderWidth: 1,
        borderColor: "rgba(34,197,94,0.3)",
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.success,
    },
    userHandle: {
        fontSize: FONT_SIZE.sm,
        color: "rgba(255,255,255,0.5)",
        marginTop: 2,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        flexWrap: "wrap",
    },
    metaText: {
        fontSize: 11,
        color: "rgba(255,255,255,0.5)",
        marginLeft: 4,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.text,
        marginLeft: 4,
    },
    // Body
    body: {
        padding: SPACING.lg,
    },
    sectionTitleContainer: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    sectionSubtitle: {
        fontSize: 11,
        color: COLORS.secondary,
        marginTop: 2,
    },
    fieldsGrid: {
        gap: SPACING.sm,
    },
    infoField: {
        marginBottom: SPACING.sm,
    },
    infoFieldLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.primary,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    infoFieldInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoFieldIcon: {
        marginRight: 10,
    },
    infoFieldValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textLight,
        flex: 1,
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        marginVertical: SPACING.lg,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    modalIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    modalTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: COLORS.text,
    },
    modalSubtitle: {
        fontSize: 11,
        color: COLORS.secondary,
    },
    modalClose: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
    },
    modalBody: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        maxHeight: 400,
    },
    modalSectionLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: SPACING.sm,
    },
    modalField: {
        marginBottom: SPACING.sm,
    },
    modalFieldLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.primary,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    modalInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
    },
    modalInputIcon: {
        marginRight: 8,
    },
    modalInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
    },
    modalDivider: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        marginVertical: SPACING.md,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    modalCancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalCancelText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.secondary,
    },
    modalSaveButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
    },
    modalSaveButtonDisabled: {
        opacity: 0.6,
    },
    modalSaveText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
        marginLeft: 4,
    },
});

export default UsersScreen;
