import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTransfers } from "../hooks/useTransfers.js";
import { useAccounts } from "../../accounts/hooks/useAccounts.js";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
} from "../../../shared/constants/theme.js";
import { LoadingSpinner } from "../../../shared/components/Common.jsx";

const TransfersScreen = () => {
    const { loading: transferLoading, makeTransfer } = useTransfers();
    const { accounts, loading: accountsLoading } = useAccounts();
    const [formData, setFormData] = useState({
        account_origin_id: "",
        numero_cuenta_destino: "",
        amount: "",
        description: "",
    });

    const handleFieldChange = (field, value) => {
        let sanitized = value;
        if (field === "amount") {
            sanitized = value.replace(/[^0-9.]/g, "");
        }
        if (field === "numero_cuenta_destino") {
            sanitized = value.replace(/[^0-9]/g, "").slice(0, 20);
        }
        setFormData((prev) => ({ ...prev, [field]: sanitized }));
    };

    const handleSubmit = async () => {
        if (!formData.account_origin_id) {
            Alert.alert("Error", "Selecciona una cuenta de origen");
            return;
        }
        if (!formData.numero_cuenta_destino?.trim()) {
            Alert.alert("Error", "Ingresa el numero de cuenta destino");
            return;
        }
        if (!formData.amount || Number(formData.amount) <= 0) {
            Alert.alert("Error", "Ingresa un monto valido");
            return;
        }

        Alert.alert(
            "Confirmar transferencia",
            `Transferir Q ${Number(formData.amount).toLocaleString("es-GT", { minimumFractionDigits: 2 })} a la cuenta ${formData.numero_cuenta_destino}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            await makeTransfer({
                                account_origin_id: Number(formData.account_origin_id),
                                numero_cuenta_destino: formData.numero_cuenta_destino,
                                amount: Number(formData.amount),
                                description: formData.description || "Transferencia desde app movil",
                            });
                            Alert.alert("Exito", "Transferencia realizada correctamente");
                            setFormData({
                                account_origin_id: "",
                                numero_cuenta_destino: "",
                                amount: "",
                                description: "",
                            });
                        } catch (err) {
                            Alert.alert("Error", err?.response?.data?.message || "Error al realizar transferencia");
                        }
                    },
                },
            ]
        );
    };

    if (accountsLoading) return <LoadingSpinner />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transferencias</Text>
                <Text style={styles.headerSubtitle}>Envia dinero de forma segura</Text>
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                {/* CUENTA ORIGEN */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Cuenta de origen</Text>
                    <View style={styles.pickerContainer}>
                        <MaterialIcons name="account-balance-wallet" size={18} color={COLORS.secondary} style={styles.fieldIcon} />
                        <TextInput
                            style={styles.pickerText}
                            placeholder="ID de cuenta de origen"
                            placeholderTextColor={COLORS.secondary}
                            value={formData.account_origin_id}
                            onChangeText={(v) => handleFieldChange("account_origin_id", v)}
                            keyboardType="numeric"
                        />
                    </View>
                    {accounts.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountsList}>
                            {accounts.map((acc) => (
                                <TouchableOpacity
                                    key={acc.id}
                                    style={[
                                        styles.accountChip,
                                        formData.account_origin_id === String(acc.id) && styles.accountChipActive,
                                    ]}
                                    onPress={() => setFormData((prev) => ({ ...prev, account_origin_id: String(acc.id) }))}
                                >
                                    <Text
                                        style={[
                                            styles.accountChipText,
                                            formData.account_origin_id === String(acc.id) && styles.accountChipTextActive,
                                        ]}
                                    >
                                        {acc.nombre_cuenta || acc.tipo_cuenta} ****{acc.numero_cuenta?.slice(-4)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* CUENTA DESTINO */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Numero de cuenta destino</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="account-balance" size={18} color={COLORS.secondary} style={styles.fieldIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa el numero de cuenta"
                            placeholderTextColor={COLORS.secondary}
                            value={formData.numero_cuenta_destino}
                            onChangeText={(v) => handleFieldChange("numero_cuenta_destino", v)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* MONTO */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Monto (Q)</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="attach-money" size={18} color={COLORS.secondary} style={styles.fieldIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={COLORS.secondary}
                            value={formData.amount}
                            onChangeText={(v) => handleFieldChange("amount", v)}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* DESCRIPCION */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Descripcion (opcional)</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="description" size={18} color={COLORS.secondary} style={styles.fieldIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Pago de servicio"
                            placeholderTextColor={COLORS.secondary}
                            value={formData.description}
                            onChangeText={(v) => handleFieldChange("description", v)}
                        />
                    </View>
                </View>

                {/* BOTON ENVIAR */}
                <TouchableOpacity
                    style={[styles.submitButton, transferLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={transferLoading}
                >
                    {transferLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <MaterialIcons name="send" size={18} color="#fff" />
                            <Text style={styles.submitText}>Enviar transferencia</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
    body: {
        padding: SPACING.lg,
    },
    fieldContainer: {
        marginBottom: SPACING.md,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primary,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
    },
    fieldIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
    },
    pickerText: {
        flex: 1,
        paddingVertical: 12,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
    },
    accountsList: {
        marginTop: 8,
    },
    accountChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    accountChipActive: {
        backgroundColor: COLORS.primary + "15",
        borderColor: COLORS.primary + "30",
    },
    accountChipText: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.secondary,
    },
    accountChipTextActive: {
        color: COLORS.primary,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: SPACING.md,
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: "#fff",
    },
});

export default TransfersScreen;
