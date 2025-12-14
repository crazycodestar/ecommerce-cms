import { vars } from "@/db/lib/vars";
import { useLiveQuery } from "dexie-react-hooks";
import { VariableItem, VariablePopover } from "../variable-library";
import { ColorSchema } from "./shared";

export function VariablePicker({
  color,
  onChange,
}: {
  color: ColorSchema & { type: "variable" };
  onChange: (color: ColorSchema & { type: "variable" }) => void;
}) {
  const variable = useLiveQuery(
    () => vars.getBySlug(color.value),
    [color.value]
  );
  if (!variable) return null;

  return (
    <VariablePopover
      varType="color"
      defaultValue={variable}
      state="library"
      offset={7}
      onComplete={(value) =>
        onChange({
          type: "variable",
          value,
        })
      }
    >
      <VariableItem variable={variable} className="hover:bg-transparent" />
    </VariablePopover>
  );
}
