import React, { useEffect, useState } from "react";
import {
  getTemplateByUrl,
  editTemplateByUrl,
  createTemplate,
} from "../../services/template.service";
import ComponentCard from "../../components/common/ComponentCard";
import { AdminFeaturedImage } from "../../components/ui/featured-image/FeaturedImage";
import { useNavigationPrompt } from "../../hooks/useNavigationPrompt";
import Button from "../../components/ui/button/Button";
import { useNotification } from "../../context/NotificationContext";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import { TemplateType } from "../../types/template.type";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

type SettingsProps<T> = {
  content: T;
  isAvailable: boolean;
};

const SettingPage: React.FC = () => {
  const { setNotification } = useNotification();
  const { setBlock } = useNavigationPrompt();

  const [logoImage, setLogoImage] = useState<SettingsProps<{ id: number; url: string }>>({
    content: { id: 0, url: "" },
    isAvailable: false,
  });

  const [headScript, setHeadScript] = useState<SettingsProps<string>>({ content: "", isAvailable: false });
  const [preBodyScript, setPreBodyScript] = useState<SettingsProps<string>>({ content: "", isAvailable: false });
  const [postBodyScript, setPostBodyScript] = useState<SettingsProps<string>>({ content: "", isAvailable: false });

  // Load all settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const endpoints = [
        { key: "logo", url: "/logo-header", setter: setLogoImage },
        { key: "head", url: "/script/head", setter: setHeadScript },
        { key: "prebody", url: "/script/prebody", setter: setPreBodyScript },
        { key: "postbody", url: "/script/postbody", setter: setPostBodyScript },
      ];

      for (const item of endpoints) {
        try {
          const res = await getTemplateByUrl(item.url);
          if (res?.status_code === 200 && res.data) {
            item.setter({
              content: JSON.parse(res.data.content),
              isAvailable: true,
            });
          }
        } catch (e) {
          console.error(`Error loading ${item.key}:`, e);
        }
      }
    };

    fetchSettings();
  }, []);

  const handleSaveTemplate = async (url: string, type: string, content: any, isAvailable: boolean) => {
    try {
      const payload = JSON.stringify(content);
      const action = isAvailable 
        ? editTemplateByUrl(url, type as TemplateType, payload) 
        : createTemplate(url, type as TemplateType, payload);
      
      return await action;
    } catch (e) {
      console.error(`Error saving ${url}:`, e);
      return false;
    }
  };

  const showNotify = (success: boolean, message: string) => {
    setNotification({
      message: message,
      type: success ? "neutral" : "fail",
      isClosed: false,
    });
    if (success) setBlock(false);
  };

  const saveLogoHandler = async () => {
    const success = await handleSaveTemplate("/logo-header", "Logo", logoImage.content, logoImage.isAvailable);
    showNotify(!!success, success ? "Logo header updated successfully" : "Failed to update logo");
    if (success) setLogoImage(prev => ({ ...prev, isAvailable: true }));
  };

  const saveScriptsHandler = async () => {
    const tasks = [
      handleSaveTemplate("/script/head", "Script", headScript.content, headScript.isAvailable),
      handleSaveTemplate("/script/prebody", "Script", preBodyScript.content, preBodyScript.isAvailable),
      handleSaveTemplate("/script/postbody", "Script", postBodyScript.content, postBodyScript.isAvailable),
    ];

    const results = await Promise.all(tasks);
    const allSuccess = results.every(res => !!res);

    showNotify(allSuccess, allSuccess ? "All scripts saved successfully" : "Some scripts failed to save");
    
    // Refresh availability states
    if (results[0]) setHeadScript(prev => ({ ...prev, isAvailable: true }));
    if (results[1]) setPreBodyScript(prev => ({ ...prev, isAvailable: true }));
    if (results[2]) setPostBodyScript(prev => ({ ...prev, isAvailable: true }));
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Branding Section */}
        <div className="col-span-12 lg:col-span-4">
          <ComponentCard title="Site Branding">
            <div className="space-y-4">
              <Label>Header Logo</Label>
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl">
                <AdminFeaturedImage
                  url={`${API_URL}/${logoImage.content.url}`}
                  onSave={(file) => {
                    setLogoImage(prev => ({ ...prev, content: { id: file.id, url: file.path } }));
                    setBlock(true);
                  }}
                />
              </div>
              <Button type="button" onClick={saveLogoHandler} className="w-full">Update Logo</Button>
            </div>
          </ComponentCard>
        </div>

        {/* Scripts Section */}
        <div className="col-span-12 lg:col-span-8">
          <ComponentCard title="Advanced Customization (Scripts)">
            <div className="space-y-6">
              <div>
                <Label>Header Scripts</Label>
                <p className="text-xs text-gray-500 mb-2">Injected inside the {`<head>`} tag. Useful for Analytics or Meta tags.</p>
                <TextArea 
                  placeholder="<!-- Paste your script here -->" 
                  value={headScript.content} 
                  onChange={val => { setHeadScript(prev => ({ ...prev, content: val })); setBlock(true); }}
                  rows={4}
                />
              </div>

              <div>
                <Label>After Body Open</Label>
                <p className="text-xs text-gray-500 mb-2">Injected right after the {`<body>`} opening tag.</p>
                <TextArea 
                  placeholder="<!-- Paste your script here -->" 
                  value={preBodyScript.content} 
                  onChange={val => { setPreBodyScript(prev => ({ ...prev, content: val })); setBlock(true); }}
                  rows={4}
                />
              </div>

              <div>
                <Label>Before Body Close</Label>
                <p className="text-xs text-gray-500 mb-2">Injected right before the {`</body>`} closing tag.</p>
                <TextArea 
                  placeholder="<!-- Paste your script here -->" 
                  value={postBodyScript.content} 
                  onChange={val => { setPostBodyScript(prev => ({ ...prev, content: val })); setBlock(true); }}
                  rows={4}
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button onClick={saveScriptsHandler} type="button" variant="primary" className="px-10">Save All Scripts</Button>
              </div>
            </div>
          </ComponentCard>
        </div>

      </div>
    </div>
  );
};

export default SettingPage;
