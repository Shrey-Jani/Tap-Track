import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>["name"];

interface TabIconProps{
  name: FontAwesomeIconName;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({name, color}) => (
  <FontAwesome name = {name} size={22} color = {color}/>
);
  const TAB_BAR_STYLE = {
    backgroundColor: "#121218",
    borderTopColor: "#2A2A3C",
  };
  const TabLayout: React.FC = () => {
    return(
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4ADE80",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: TAB_BAR_STYLE,
        headerShown: false,
      }}
      >
        <Tabs.Screen name="index" 
        options = {{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon name = "home" color={color} />,
        }}
        />

        <Tabs.Screen name="add"
        options = {{
          title: "Add",
          tabBarIcon: ({ color }) => <TabIcon name = "plus-circle" color = {color}/>,
        }}
        />

        <Tabs.Screen name = "summary"
        options = {{
          title: "Summary",
          tabBarIcon: ({ color }) => <TabIcon name = "bar-chart" color = {color}/>,
        }}
        />

        <Tabs.Screen name = "settings"
        options = {{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabIcon name= "cog" color = {color}/>,
        }}
        />
      </Tabs>
    );
  };
