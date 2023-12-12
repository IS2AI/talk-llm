import { Layout } from "@components/index";
import { useApiKey } from "@context/ApiKeyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const Auth: React.FC = () => {
  const [inputKey, setInputKey] = useState<string>("");
  const navigation = useNavigation();
  const { setApiKey } = useApiKey();

  useEffect(() => {
    const checkApiKey = async () => {
      const storedApiKey = await AsyncStorage.getItem("apiKey");
      if (storedApiKey) {
        setApiKey(storedApiKey);
        navigation.navigate("Home");
      }
    };

    checkApiKey();
  }, [setApiKey]);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("apiKey", inputKey);
    setApiKey(inputKey);
    navigation.navigate("Home");
  };

  return (
    <Layout>
      <View className="flex justify-center">
        <Text className="text-3xl font-bold text-center text-gray-700">
          ISSAI Talk
        </Text>
        <Text className="text-lg font-semibold text-center text-gray-600">
          Your AI voice assistant
        </Text>
      </View>
      <View className="w-full space-y-1">
        <Text>API-KEY</Text>
        <TextInput
          value={inputKey}
          onChangeText={setInputKey}
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="none"
          className="border text-gray-600 font-medium p-2 text-lg rounded-xl border-gray-600"
        />
      </View>
      <TouchableOpacity
        onPress={handleGetStarted}
        className="bg-emerald-600 p-4 rounded-xl w-full"
      >
        <Text className="text-center font-bold text-white text-xl">
          Get Started
        </Text>
      </TouchableOpacity>
    </Layout>
  );
};

export default Auth;
