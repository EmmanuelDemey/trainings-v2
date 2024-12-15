import { useTranslation } from "react-i18next";
import Button from "./Button";

const Language = () => {
  const { i18n } = useTranslation();
  return (
    <div style={{ position: "absolute", top: 16, left: 16 }}>
      <Button
        type="button"
        onClick={() => {
          i18n.changeLanguage("fr");
        }}
        label="FR"
      />
      <Button
        type="button"
        onClick={() => {
          i18n.changeLanguage("en");
        }}
        label="EN"
      />
    </div>
  );
};

export default Language;
