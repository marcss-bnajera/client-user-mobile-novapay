import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth"

import NovaPayLogo from "../../../../assets/logo_novapay_signo.png";

import imgUno from "../../../../assets/carrusel_uno.png";
import imgDos from "../../../../assets/carrusel_dos.png";
import imgTres from "../../../../assets/carrusel_tres.png";

const carouselSlides = [
    { image: imgUno },
    { image: imgDos },
    { image: imgTres },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
    const [current, setCurrent] = useState(0);

    const {handleLogin, loading} = useAuth();

    const { control, handleSubmit, formState: { errors }} = useForm({
        defaultValues: {
            emailOrUsername: "",
            password: ""
        }
    });

    // Lógica del intervalo para mover las imágenes de fondo de forma automática
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((c) => (c + 1) % carouselSlides.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    const onSubmit = async (data) => {
        try {
            await handleLogin(data)
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message || "Error al iniciar sesión"
                Alert.alert("Error", message)
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            {/* FONDO DINÁMICO EN MOVIMIENTO */}
            <View style={StyleSheet.absoluteFillObject}>
                <Image 
                    source={carouselSlides[current].image} 
                    style={styles.backgroundImage} 
                    resizeMode="cover"
                />
                <View style={styles.darkOverlay} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* TARJETA DEL FORMULARIO */}
                <View style={styles.cardForm}>
                    
                    {/* El Logo */}
                    <View style={styles.header}>
                        <Image source={NovaPayLogo} style={styles.logo} resizeMode="contain"/>
                    </View>

                    <Controller 
                        control={control}
                        rules={{ required: "Email o Usuario requerido"}}
                        render={({ field: { onChange, value }}) => (
                            <Input 
                                label="Email o Usuario"
                                placeholder="correo@ejemplo.com o usuario"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.emailOrUsername?.message}
                            />
                        )}
                        name = "emailOrUsername"
                    />

                    <Controller 
                        control={control}
                        rules={{ required: "Contraseña requerido"}}
                        render={({ field: { onChange, value }}) => (
                            <Input 
                                label="Contraseña"
                                placeholder="●●●●●●●●"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                secureTextEntry
                                error={errors.password?.message}
                            />
                        )}
                        name = "password"
                    />

                    <Button 
                        title="Iniciar Sesión"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.button}
                    />

                    {/* Indicadores de página del carrusel */}
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
                        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
                            Registrate
                        </Text>
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
        backgroundColor: "rgba(4, 8, 16, 0.75)", 
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
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
        backgroundColor: "rgba(15, 23, 42, 0.88)", 
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.8)", 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    button: {
        marginTop: SPACING.md,
        backgroundColor: "#10b981", 
    },
    carouselIndicators: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 20,
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
        backgroundColor: "rgba(0, 0, 0, 0.15)",
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

export default LoginScreen;