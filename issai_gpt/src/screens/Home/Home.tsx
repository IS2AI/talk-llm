import { Layout } from "@components/index";
import Voice from "@react-native-voice/voice";
import axios from "axios";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableWithoutFeedback, View } from "react-native";

interface Message {
  role: string;
  content: string;
}

const Home: React.FC = () => {
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [chatGPTResponse, setChatGPTResponse] = useState<string>("");
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const scale = useRef(new Animated.Value(1)).current;
  const inverseScale = scale.interpolate({
    inputRange: [1, 1.2],
    outputRange: [1, 1 / 1.2],
  });

  useEffect(() => {
    const onSpeechResults = (e: any) => {
      setTranscribedText(e.value?.[0] || "");
    };

    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const speak = (text: string) => {
    Speech.speak(text);
  };

  const sendToChatGPT = async (text: string) => {
    try {
      const messages = messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      messages.push({ role: "user", content: text });

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: messages,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );
      const responseText = response.data.choices[0].message.content;
      setChatGPTResponse(responseText);
      setMessageHistory([
        ...messages,
        { role: "assistant", content: responseText },
      ]);
      speak(responseText);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Axios request failed", err.response?.data, err.toJSON());
      } else {
        console.error(err);
      }

      throw new Error("Request failed");
    }
  };

  const startRecording = async () => {
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      sendToChatGPT(transcribedText);
    } catch (e) {
      console.error(e);
    }
  };

  const onPressIn = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    startRecording();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    stopRecording();
  };

  return (
    <Layout>
      <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View
          className="w-64 h-64 rounded-full bg-blue-500 flex justify-center items-center"
          style={{ transform: [{ scale }] }}
        >
          <Animated.View style={{ transform: [{ scale: inverseScale }] }}>
            <Text className="text-3xl text-white font-semibold">Record</Text>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
      <View>
        <Text>Voice: {transcribedText}</Text>
        <Text>ChatGPT Response: {chatGPTResponse}</Text>
      </View>
    </Layout>
  );
};

export default Home;
