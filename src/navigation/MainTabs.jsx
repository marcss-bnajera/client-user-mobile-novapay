import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../shared/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import UsersScreen from "../features/users/screens/UsersScreen";
import AccountsScreen from "../features/accounts/screens/AccountsScreen";
import TransactionsScreen from "../features/transactions/screens/TransactionsScreen";
import TransfersScreen from "../features/transfers/screens/TransfersScreen";
import CardsScreen from "../features/cards/screens/CardsScreen";
import PassbooksScreen from "../features/passbooks/screens/PassbooksScreen";
import DepositsScreen from "../features/deposits/screens/DepositsScreen";
import ProductsScreen from "../features/products/screens/ProductsScreen";
import ShoppingsScreen from "../features/shoppings/screens/ShoppingsScreen";
import FavoritesScreen from "../features/favorites/screens/FavoritesScreen";
import CurrenciesScreen from "../features/currencies/screens/CurrenciesScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="DashboardMain"
            component={DashboardScreen}
            options={{ title: "NovaPay", headerShown: false }}
        />
        <Stack.Screen name="Cards" component={CardsScreen} options={{ title: "Tarjetas", headerShown: false }} />
        <Stack.Screen name="Passbooks" component={PassbooksScreen} options={{ title: "Libretas", headerShown: false }} />
        <Stack.Screen name="Deposits" component={DepositsScreen} options={{ title: "Depositos", headerShown: false }} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: "Productos", headerShown: false }} />
        <Stack.Screen name="Shoppings" component={ShoppingsScreen} options={{ title: "Adquisiciones", headerShown: false }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favoritos", headerShown: false }} />
        <Stack.Screen name="Currencies" component={CurrenciesScreen} options={{ title: "Divisas", headerShown: false }} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: "Transacciones", headerShown: false }} />
        <Stack.Screen name="Transfers" component={TransfersScreen} options={{ title: "Transferencias", headerShown: false }} />
        <Stack.Screen name="Accounts" component={AccountsScreen} options={{ title: "Cuentas", headerShown: false }} />
    </Stack.Navigator>
);

const UsersStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="UsersMain"
            component={UsersScreen}
            options={{ title: "Mi Perfil", headerShown: false }}
        />
    </Stack.Navigator>
);

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: "#0a1020",
                    borderTopWidth: 1,
                    borderTopColor: "rgba(30,41,59,0.6)",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case "Dashboard":
                            iconName = "home";
                            break;
                        case "Transactions":
                            iconName = "receipt-long";
                            break;
                        case "Transfers":
                            iconName = "send";
                            break;
                        case "Profile":
                            iconName = "person";
                            break;
                        default:
                            iconName = "circle";
                    }
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{ title: "Inicio" }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsStack}
                options={{ title: "Movimientos" }}
            />
            <Tab.Screen
                name="Transfers"
                component={TransfersStack}
                options={{ title: "Transferir" }}
            />
            <Tab.Screen
                name="Profile"
                component={UsersStack}
                options={{ title: "Perfil" }}
            />
        </Tab.Navigator>
    );
};

const TransactionsStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="TransactionsMain" component={TransactionsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const TransfersStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="TransfersMain" component={TransfersScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

export default MainTabs;
