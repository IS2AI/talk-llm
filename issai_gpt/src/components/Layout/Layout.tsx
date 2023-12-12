import { Keyboard, Pressable } from "react-native";
import SafeAreaView from "react-native-safe-area-view";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SafeAreaView forceInset={{ top: "always" }} className="h-full">
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
        }}
        className="flex-1 flex justify-around items-center p-4"
      >
        {children}
      </Pressable>
    </SafeAreaView>
  );
};

export default Layout;
