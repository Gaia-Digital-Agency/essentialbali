import React, { useEffect, useState } from "react";
import {
  getTemplateByUrl,
  editTemplateByUrl,
  createTemplate,
} from "../../services/template.service";
import ComponentCard from "../../components/common/ComponentCard";
import { AdminFeaturedImage } from "../../components/ui/featured-image/FeaturedImage";
import { AssetMedia } from "../../types/media.type";
import { useNavigationPrompt } from "../../hooks/useNavigationPrompt";
import Button from "../../components/ui/button/Button";
import { useNotification } from "../../context/NotificationContext";
import TextArea from "../../components/form/input/TextArea";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

type SettingsProps<T> = {
  content: T,
  isAvailable: boolean
  isChanged: boolean
}

const SettingPage: React.FC = () => {
  const defaultSettingProps = {
    isAvailable: false,
    isChanged: false
  }
  const { setNotification } = useNotification();
  const [logoImage, setLogoImage] = useState<SettingsProps<{ id: number; url: string }>>({
    content: {
      id: 0,
      url: "",
    },
    ...defaultSettingProps
  });

  const [headScript, setHeadScript] = useState<SettingsProps<string>>({
    content: "",
    ...defaultSettingProps
  })
  const [preBodyScript, setPreBodyScript] = useState<SettingsProps<string>>({
    content: '',
    ...defaultSettingProps
  })
  const [postBodyScript, setPostBodyScript] = useState<SettingsProps<string>>({
    content: "",
    ...defaultSettingProps
  })
  
  // const [isLogoAvailable, setIsLogoAvailable] = useState<boolean>(false);
  const { setBlock, isDirty } = useNavigationPrompt();
  useEffect(() => {
    ;(async () => {
      try {
        const getTemplate = await getTemplateByUrl("/logo-header");
        if (getTemplate?.status_code == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setLogoImage((prev) => ({...prev, content: data, isAvailable: true}));
        }
      } catch (e) {
        console.log(e);
      }
    })();
    ;(async () => {
      try {
        const getTemplate = await getTemplateByUrl("/script/head");
        if (getTemplate?.status_code == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setHeadScript((prev) => ({...prev, content: data, isAvailable: true}));
        }
      } catch (e) {
        console.log(e);
      }
    })();
    ;(async () => {
      try {
        const getTemplate = await getTemplateByUrl("/script/prebody");
        if (getTemplate?.status_code == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setPreBodyScript((prev) => ({...prev, content: data, isAvailable: true}));
        }
      } catch (e) {
        console.log(e);
      }
    })();
    ;(async () => {
      try {
        const getTemplate = await getTemplateByUrl("/script/postbody");
        if (getTemplate?.status_code == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setPostBodyScript((prev) => ({...prev, content: data, isAvailable: true}));
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  const saveLogoImageHandler = (file: AssetMedia) => {
    setLogoImage(prev => ({...prev, content: { id: file.id, url: file.path }}));
    setBlock(true);
  };

  const failedSave = (message: string = "Unexpected Error") => {
    setNotification({ message: message, type: "fail", isClosed: false });
    return false;
  };
  const successSave = (message: string = "successfully change logo header") => {
    setNotification({ message: message, type: "neutral", isClosed: false });
    setBlock(false);
    return true;
  };

  const saveSettingHandler = async () => {

  };

  const saveLogoHandler = async () => {
    if (logoImage.isAvailable) {
      try {
        const edit = await editTemplateByUrl(
          "/logo-header",
          "Logo",
          JSON.stringify(logoImage.content)
        );
        if (edit) {
          return successSave();
        } else {
          return failedSave();
        }
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    } else {
      try {
        const create = await createTemplate(
          "/logo-header",
          "Logo",
          JSON.stringify(logoImage.content)
        );
        if (create) {
          return successSave();
        }
        return failedSave();
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    }
  }

  const saveScripts = async () => {
    ;(async () => {
      try {
        if(headScript.isAvailable) {
          const edit = await editTemplateByUrl(
            '/script/head',
            'Script',
            JSON.stringify(headScript.content)
          )
          if(edit) return successSave();
          return failedSave()
        } else {
          const create = await createTemplate(
            '/script/head',
            'Script',
            JSON.stringify(headScript.content)
          )
          if(create) return successSave();
          return failedSave();
        }
      } catch(e) {
        console.log(e);
        return failedSave()
      }
    })()

    ;(async () => {
      try {
        if(preBodyScript.isAvailable) {
          const edit = await editTemplateByUrl(
            '/script/prebody',
            'Script',
            JSON.stringify(preBodyScript.content)
          )
          if(edit) return successSave();
          return failedSave()
        } else {
          const create = await createTemplate(
            '/script/prebody',
            'Script',
            JSON.stringify(preBodyScript.content)
          )
          if(create) return successSave();
          return failedSave();
        }
      } catch(e) {
        console.log(e);
        return failedSave()
      }
    })()

    ;(async () => {
      try {
        if(postBodyScript.isAvailable) {
          const edit = await editTemplateByUrl(
            '/script/postbody',
            'Script',
            JSON.stringify(postBodyScript.content)
          )
          if(edit) return successSave();
          return failedSave()
        } else {
          const create = await createTemplate(
            '/script/postbody',
            'Script',
            JSON.stringify(postBodyScript.content)
          )
          if(create) return successSave();
          return failedSave();
        }
      } catch(e) {
        console.log(e);
        return failedSave()
      }
    })()
  }

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-6">
          <ComponentCard title="Logo Image">
            <div>
              <AdminFeaturedImage
                url={`${API_URL}/${logoImage.content.url}`}
                onSave={saveLogoImageHandler}
                // ratio="16/9"
              />
            </div>
            <Button onClick={saveLogoHandler}>Save Logo</Button>
          </ComponentCard>
          <ComponentCard title="Additional Scripts">
            <>
            <p>Insert scripts inside {'<head>'} tag</p>
              <TextArea placeholder="<script>" value={headScript.content} onChange={e => {setHeadScript(prev => ({...prev, content: e, isChanged: true})); setBlock(true)}}>

              </TextArea>
            </>
            <div className="spacer py-8"></div>
            <>
            <p>Insert scripts right after {'<body>'} tag</p>
              <TextArea placeholder="<script>" value={preBodyScript.content} onChange={e => {setPreBodyScript(prev => ({...prev, content: e, isChanged: true})); setBlock(true)}}>

              </TextArea>
            </>
            <div className="spacer py-8"></div>
            <>
            <p>Insert scripts right before closing {'</body>'} tag</p>
              <TextArea placeholder="<script>" value={postBodyScript.content} onChange={e => {setPostBodyScript(prev => ({...prev, content: e, isChanged: true})); setBlock(true)}}>

              </TextArea>
            </>
            <div className="spacer py-8"></div>
            <Button onClick={saveScripts}>Save Scripts</Button>
          </ComponentCard>
        </div>
      </div>
      <div className="fixed bottom-6 right-6">
        {isDirty && <Button onClick={saveSettingHandler}>Save all settings</Button>}
      </div>
    </>
  );
};

export default SettingPage;
