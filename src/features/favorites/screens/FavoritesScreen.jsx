import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFavorites } from "../hooks/useFavorites.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";

const FavoritesScreen = () => {
    const { favorites, loading, error, getFavorites, addFavorite, updateFavoriteAlias, removeFavorite } = useFavorites();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState({ numero_cuenta_favorito: "", alias: "" });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const filtered = favorites.filter(
        (f) =>
            f.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.numero_cuenta_favorito?.includes(searchTerm)
    );

    const handleDelete = (id) => {
        Alert.alert("Eliminar favorito", "¿Estas seguro de eliminar este favorito?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await removeFavorite(id);
                    } catch (err) {
                        Alert.alert("Error", err?.response?.data?.message || "Error al eliminar");
                    }
                },
            },
        ]);
    };

    const handleEdit = (favorite) => {
        setSelected(favorite);
        setFormData({ numero_cuenta_favorito: favorite.numero_cuenta_favorito || "", alias: favorite.alias || "" });
        setFormErrors({});
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelected(null);
        setFormData({ numero_cuenta_favorito: "", alias: "" });
        setFormErrors({});
        setShowModal(true);
    };

    const handleSave = async () => {
        const errors = {};
        if (!selected) {
            if (!formData.numero_cuenta_favorito.trim()) {
                errors.numero_cuenta_favorito = "El numero de cuenta es obligatorio";
            } else if (!/^\d{12}$/.test(formData.numero_cuenta_favorito)) {
                errors.numero_cuenta_favorito = "Debe ser exactamente 12 digitos";
            }
        }
        if (!formData.alias.trim()) {
            errors.alias = "El alias es obligatorio";
        } else if (formData.alias.trim().length < 2 || formData.alias.trim().length > 50) {
            errors.alias = "El alias debe tener entre 2 y 50 caracteres";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setSaving(true);
            if (selected) {
                await updateFavoriteAlias(selected.id, { alias: formData.alias });
            } else {
                await addFavorite({ usuario_id: null, ...formData });
            }
            setShowModal(false);
            setSelected(null);
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (field, value) => {
        let sanitized = value;
        if (field === "numero_cuenta_favorito") {
            sanitized = value.replace(/[^0-9]/g, "").slice(0, 12);
        }
        setFormData((prev) => ({ ...prev, [field]: sanitized }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const renderItem = ({ item }) => (
        <View style={styles.favoriteCard}>
            <View style={styles.favoriteLeft}>
                <View style={styles.favoriteAvatar}>
                    <Text style={styles.favoriteAvatarText}>{item.alias?.[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.favoriteInfo}>
                    <Text style={styles.favoriteAlias}>{item.alias}</Text>
                    <View style={styles.favoriteNumberRow}>
                        <MaterialIcons name="person" size={12} color={COLORS.secondary} />
                        <Text style={styles.favoriteNumber}>**** **** {item.numero_cuenta_favorito?.slice(-4)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.favoriteActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
                    <MaterialIcons name="edit" size={14} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
                    <MaterialIcons name="delete" size={14} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Favoritos</Text>
                        <Text style={styles.headerSubtitle}>Gestiona tus cuentas favoritas</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <MaterialIcons name="add" size={18} color="#fff" />
                        <Text style={styles.addButtonText}>Agregar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* RESUMEN */}
            <View style={styles.summary}>
                <View style={styles.summaryIcon}>
                    <MaterialIcons name="star" size={20} color={COLORS.success} />
                </View>
                <View>
                    <Text style={styles.summaryValue}>
                        {loading ? "—" : `${favorites.length} favorito${favorites.length !== 1 ? "s" : ""}`}
                    </Text>
                    <Text style={styles.summaryLabel}>Cuentas guardadas</Text>
                </View>
            </View>

            {/* BUSCADOR */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={18} color={COLORS.secondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por alias o numero de cuenta..."
                    placeholderTextColor={COLORS.secondary}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {/* LISTA */}
            {error && !favorites.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState message={searchTerm ? "No se encontraron favoritos" : "No tienes favoritos aun"} />
                    }
                />
            )}

            {/* MODAL */}
            <Modal visible={showModal} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderLeft}>
                                <View style={styles.modalIcon}>
                                    <MaterialIcons name="star" size={18} color={COLORS.success} />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>
                                        {selected ? "Editar favorito" : "Agregar favorito"}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>
                                        {selected ? "Cambia el alias" : "Guarda una cuenta favorita"}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowModal(false)}
                            >
                                <MaterialIcons name="close" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {!selected && (
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Numero de cuenta</Text>
                                    <View style={[styles.modalInputContainer, formErrors.numero_cuenta_favorito && styles.modalInputError]}>
                                        <MaterialIcons name="tag" size={16} color={COLORS.secondary} style={styles.modalInputIcon} />
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="Ej. 480123456789"
                                            placeholderTextColor={COLORS.secondary}
                                            value={formData.numero_cuenta_favorito}
                                            onChangeText={(v) => handleFieldChange("numero_cuenta_favorito", v)}
                                            keyboardType="numeric"
                                            maxLength={12}
                                        />
                                    </View>
                                    {formErrors.numero_cuenta_favorito && (
                                        <Text style={styles.modalError}>{formErrors.numero_cuenta_favorito}</Text>
                                    )}
                                </View>
                            )}

                            {selected && (
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabelReadonly}>Numero de cuenta</Text>
                                    <View style={styles.modalReadonlyField}>
                                        <MaterialIcons name="tag" size={16} color={COLORS.secondary} />
                                        <Text style={styles.modalReadonlyText}>
                                            **** **** {selected.numero_cuenta_favorito?.slice(-4)}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.modalField}>
                                <Text style={styles.modalFieldLabel}>Alias</Text>
                                <View style={[styles.modalInputContainer, formErrors.alias && styles.modalInputError]}>
                                    <MaterialIcons name="person" size={16} color={COLORS.secondary} style={styles.modalInputIcon} />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Ej. Mama, Juan del trabajo..."
                                        placeholderTextColor={COLORS.secondary}
                                        value={formData.alias}
                                        onChangeText={(v) => handleFieldChange("alias", v)}
                                    />
                                </View>
                                {formErrors.alias && <Text style={styles.modalError}>{formErrors.alias}</Text>}
                            </View>
                        </View>

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
                                    {saving ? "Guardando..." : selected ? "Guardar alias" : "Agregar favorito"}
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
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.success,
        gap: 4,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#fff",
    },
    summary: {
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
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.success + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    summaryValue: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        color: COLORS.text,
    },
    summaryLabel: {
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
    listContent: {
        padding: SPACING.lg,
        paddingTop: SPACING.sm,
        gap: 8,
    },
    favoriteCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    favoriteLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    favoriteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.success,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    favoriteAvatarText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    favoriteInfo: {
        flex: 1,
    },
    favoriteAlias: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
    },
    favoriteNumberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },
    favoriteNumber: {
        fontSize: 11,
        color: COLORS.secondary,
        fontFamily: "monospace",
    },
    favoriteActions: {
        flexDirection: "row",
        gap: 6,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    deleteButton: {
        backgroundColor: COLORS.error + "10",
        borderColor: COLORS.error + "20",
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
        borderRadius: 10,
        backgroundColor: COLORS.success + "15",
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
        paddingVertical: SPACING.md,
        gap: 12,
    },
    modalField: {
        gap: 4,
    },
    modalFieldLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.success,
        textTransform: "uppercase",
        letterSpacing: 1.2,
    },
    modalFieldLabelReadonly: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.secondary,
        textTransform: "uppercase",
        letterSpacing: 1.2,
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
    modalInputError: {
        borderColor: COLORS.error + "80",
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
    modalError: {
        fontSize: 11,
        color: COLORS.error,
        marginLeft: 4,
    },
    modalReadonlyField: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    modalReadonlyText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.secondary,
        fontFamily: "monospace",
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
        backgroundColor: COLORS.success,
        gap: 4,
    },
    modalSaveButtonDisabled: {
        opacity: 0.6,
    },
    modalSaveText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
    },
});

export default FavoritesScreen;
