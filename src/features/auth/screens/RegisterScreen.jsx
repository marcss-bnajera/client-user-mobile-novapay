import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth"

import NovaPayLogo from "../../../../assets/logo_novapay_signo.png";

import imgCuatro from "../../../../assets/carrusel_cuatro.png";
import imgCinco from "../../../../assets/carrusel_cinco.png";
import imgSeis from "../../../../assets/carrusel_seis.png";

const carouselSlides = [
    { image: imgCuatro },
    { image: imgCinco },
    { image: imgSeis },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
    const [current, setCurrent] = useState(0);

    const { handleRegister, loading } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            Nombre: "",
            Apellido: "",
            Username: "",
            Email: "",
            Password: "",
            Dpi: "",
            Nit: "",
            Telefono: "",
            Direccion: "",
            NombreTrabajo: "",
            IngresosMensuales: ""
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((c) => (c + 1) % carouselSlides.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    const onSubmit = async (data) => {
        try {
            await handleRegister(data)

            Alert.alert(
                "Registro exitoso",
                "Tu cuenta ha sido creada. Ahora puedes iniciar sesión",
                [{ text: "ok", onPress: () => navigation.navigate("Login")}]
            )
        } catch (error) {
            console.error(error)
            const message = error.response?.data?.message || "Error al registrarte"
            Alert.alert("Error", message)
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={StyleSheet.absoluteFillObject}>
                <Image 
                    source={carouselSlides[current].image} 
                    style={styles.backgroundImage} 
                    resizeMode="cover"
                />
                <View style={styles.darkOverlay} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.cardForm}>
                    
                    <View style={styles.header}>
                        <Image source={NovaPayLogo} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.form}>

                        <Controller 
                            control={control}
                            rules={{ required: "Nombre requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Nombre"
                                    placeholder="Tu primer nombre"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.Nombre?.message}
                                />
                            )}
                            name="Nombre"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "Apellido requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Apellido"
                                    placeholder="Tu apellido"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.Apellido?.message}
                                />
                            )}
                            name="Apellido"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "Usuario requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Usuario"
                                    placeholder="Tu nombre de usuario"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    error={errors.Username?.message}
                                />
                            )}
                            name="Username"
                        />

                        <Controller 
                            control={control}
                            rules={{ 
                                required: "Email requerido",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Email inválido"
                                }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Email"
                                    placeholder="correo@ejemplo.com"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    error={errors.Email?.message}
                                />
                            )}
                            name="Email"
                        />

                        <Controller 
                            control={control}
                            rules={{ 
                                required: "Contraseña requerida",
                                minLength: { value: 8, message: "Mínimo 8 caracteres" }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Contraseña"
                                    placeholder="●●●●●●●●"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    secureTextEntry
                                    error={errors.Password?.message}
                                />
                            )}
                            name="Password"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "DPI requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="DPI"
                                    placeholder="Tu número de DPI"
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="numeric"
                                    error={errors.Dpi?.message}
                                />
                            )}
                            name="Dpi"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "NIT requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="NIT"
                                    placeholder="Tu NIT"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    error={errors.Nit?.message}
                                />
                            )}
                            name="Nit"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "Teléfono requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Teléfono"
                                    placeholder="Tu número de teléfono"
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="phone-pad"
                                    error={errors.Telefono?.message}
                                />
                            )}
                            name="Telefono"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "Dirección requerida" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Dirección"
                                    placeholder="Tu dirección"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.Direccion?.message}
                                />
                            )}
                            name="Direccion"
                        />

                        <Controller 
                            control={control}
                            rules={{ required: "Nombre del trabajo requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Lugar de trabajo"
                                    placeholder="Nombre de tu empresa o trabajo"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.NombreTrabajo?.message}
                                />
                            )}
                            name="NombreTrabajo"
                        />

                        <Controller 
                            control={control}
                            rules={{ 
                                required: "Ingresos mensuales requeridos",
                                min: { value: 100, message: "Mínimo Q100" }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    label="Ingresos mensuales (Q)"
                                    placeholder="Ej: 5000"
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="numeric"
                                    error={errors.IngresosMensuales?.message}
                                />
                            )}
                            name="IngresosMensuales"
                        />

                        <Button 
                            title="Registrarse"
                            onPress={handleSubmit(onSubmit)}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.carouselIndicators}>
                            {carouselSlides.map((_, i) => (
                                <View 
                                    key={i} 
                                    style={[
                                        styles.dot, 
                                        i === current ? styles.activeDot : styles.inactiveDot
                                    ]} 
                                />
                            ))}
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                            <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
                                Inicia Sesión
                            </Text>
                        </View>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#040810",
    },
    backgroundImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: "absolute",
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(4, 8, 16, 0.82)",
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        paddingVertical: SPACING.xxl,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.lg,
    },
    logo: {
        height: 80,
        width: 200,
        marginBottom: SPACING.xs,
    },
    cardForm: {
        width: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        borderRadius: 24,
        paddingVertical: 36,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.8)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
    },
    form: {
        width: "100%",
    },
    button: {
        marginTop: SPACING.lg,
        backgroundColor: "#10b981",
    },
    carouselIndicators: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 24,
    },
    dot: {
        height: 3,
        borderRadius: 99,
    },
    activeDot: {
        width: 20,
        backgroundColor: "#10b981",
    },
    inactiveDot: {
        width: 6,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textLight,
    },
    link: {
        fontSize: FONT_SIZE.md,
        color: "#10b981",
        fontWeight: "700",
    },
});

export default RegisterScreen;
