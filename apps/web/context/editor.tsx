import { layers } from "@/db/lib/layers";
import { addSlot } from "@/db/resource/slots";
import { addState, getStates, updateState } from "@/db/resource/states";
import { Slot } from "@/db/types";
import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useContext, useEffect } from "react";

export type State = {
  focusElementId?: Slot["id"];
  instanceId?: Slot["id"];
  bodyId?: Slot["id"];
};

interface EditorContextType extends State {
  setFocusElementId: (
    focusElementId: Slot["id"] | undefined,
    instanceId?: Slot["id"]
  ) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const defaultState: State = {
  focusElementId: undefined,
  instanceId: undefined,
  bodyId: undefined,
};

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const states = useLiveQuery(() => getStates());

  const stateObj =
    states?.reduce((acc, state) => {
      acc[state.key as keyof State] = state.value;
      return acc;
    }, {} as State) ?? defaultState;

  useEffect(() => {
    const initPages = async () => {
      if (!stateObj.bodyId) {
        const bodyId = crypto.randomUUID();

        await addSlot({
          id: bodyId,
          element: layers.getDefaultElement("body"),
        });

        await addState({ key: "bodyId", value: bodyId });
      }
    };
    initPages();
  }, [stateObj.bodyId]);

  const setFocusElementId = (
    focusElementId: Slot["id"] | undefined,
    instanceId?: Slot["id"]
  ) => {
    updateState({ key: "focusElementId", value: focusElementId });
    updateState({ key: "instanceId", value: instanceId });
  };

  return (
    <EditorContext.Provider value={{ ...stateObj, setFocusElementId }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
