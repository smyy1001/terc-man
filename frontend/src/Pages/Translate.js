import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar } from "@mui/material";
import './Translate.css';
import { useParams, useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import styled from '@mui/material/styles/styled';
import RepeatIcon from '@mui/icons-material/Repeat';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Tooltip from '@mui/material/Tooltip';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import KeyboardHideIcon from '@mui/icons-material/KeyboardHide';
import KeyboardComponent from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import Axios from '../Axios';
import toast, { Toaster } from 'react-hot-toast';


const CustomTextField = styled(TextField)({
    "& .MuiInput-underline:after": {
        borderBottomColor: "white",
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "white",
        },
        "&:hover fieldset": {
            borderColor: "white",
        },
        "&.Mui-focused fieldset": {
            borderColor: "white !important",
        },
        "& input:valid:focus + fieldset": {
            borderColor: "white !important",
        },
    },
    "& .MuiFilledInput-root": {
        "&:before": {
            borderBottomColor: "white",
        },
        "&:hover:before": {
            borderBottomColor: "white",
        },
        "&:after": {
            borderBottomColor: "white",
        },
        "&:hover fieldset": {
            borderColor: "white",
        },
        "&.Mui-focused fieldset": {
            borderColor: "white",
        },
    },
    "& label.Mui-focused": {
        color: "white",
    },
    "& label": {
        color: "white",
    },
    "& .MuiInputBase-root": {
        "&::selection": {
            backgroundColor: "rgba(255, 255, 255, 0.99)",
            color: "#241b19",
        },
        "& input": {
            caretColor: "white",
            color: "white",
        },
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "white !important",
    },
    "& .MuiInputBase-input::selection": {
        backgroundColor: "rgba(255, 255, 255, 0.99)",
        color: "#241b19",
    },
});



const Translate = () => {
    const { lan1 = "", lan2 = "" } = useParams();
    const navigate = useNavigate();

    
    const [selectedLan1, setSelectedLan1] = useState(lan1);
    const [selectedLan2, setSelectedLan2] = useState(lan2);
    const [selectedModel, setSelectedModel] = useState('nllb');

    const [inputText, setInputText] = useState("");
    const [translation, setTranslation] = useState("");

    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [layout, setLayout] = useState("default");

    useEffect(() => {
        if (!selectedLan1 || !selectedLan2) {
            navigate(`/translate`);
        } else {
            navigate(`/translate/${selectedLan1}/${selectedLan2}`);
        }
    }, [selectedLan1, selectedLan2, navigate]);

    const handleSwitchLan = () => {
        const temp = selectedLan1;
        setSelectedLan1(selectedLan2);
        setSelectedLan2(temp);
        setInputText(translation);
        setTranslation("");
        setKeyboardVisible(false);
    };

    const translateText = async (text, srcLang, tgtLang) => {
        try {
            const response = await Axios.post(`/translate/${selectedModel}`, {
                text: text,
                src_lang: srcLang,
                tgt_lang: tgtLang,
            });
            return response.data.translation;
        } catch (error) {
            console.error("Error translating text:", error);
            throw error;
        }
    };

    const checkLan1 = () => {
        if (selectedLan1 === "") {
            toast.error("Lütfen çevrilmek istenen dilinizi seçin.");
            return false;
        }
        return true;
    }

    const checkLan2 = () => {
        if (selectedLan2 === "") {
            toast.error("Lütfen çevrilecek dilinizi seçin.");
            return false;
        }
        return true;
    }

    const checkInput = () => {
        if (inputText === "") {
            toast.error("Lütfen çevrilecek metni girin.");
            return false;
        }
        return true;
    }


    const handleTranslate = async () => {
        if (checkLan1() && checkLan2() && checkInput()) {
            try {
                const result = await translateText(inputText, selectedLan1, selectedLan2);
                setTranslation(result);
                
            } catch (error) {
                toast.error("An error occurred while translating. Check the console for details.");
            }
        }
    };


    const getCountries = () => {
        const sortAlphabetically = (countries) => {
            return countries.sort((a, b) => a.label.localeCompare(b.label));
        };

        switch (selectedModel) {
            case 'mbart50':
                return sortAlphabetically(countries_mbart50);
            case 'm2m100':
                return sortAlphabetically(countries_m2m100);
            case 'nllb':
                return sortAlphabetically(countries_nllb);
            case 'helsinkinlp':
                return sortAlphabetically(countries_helsinkinlp);
            default:
                return [];
        }
    };


    const getCountriesSource = () => {
        if (selectedModel === 'helsinkinlp') {
            return [{ code: 'en', label: 'İngilizce' },];
        }
        else { return getCountries(); }
    };

    const handleCopy = () => {
        if (!translation) {
            toast.error("Kopyalanacak içerik bulunamadı!");
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(translation)
                .then(() => {
                    toast.success("Kopyalandı!");
                })
                .catch(() => {
                    toast.error("Kopyalama başarısız!");
                });
        } else {
            try {
                const textarea = document.createElement("textarea");
                textarea.value = translation;
                textarea.style.position = "fixed";
                textarea.style.opacity = 0;
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const success = document.execCommand("copy");
                document.body.removeChild(textarea);

                if (success) {
                    toast.success("Kopyalandı!");
                } else {
                    toast.error("Kopyalama başarısız!");
                }
            } catch (error) {
                console.error("Fallback copy failed:", error);
                toast.error("Bu tarayıcıda kopyalama yapılamamaktadır!");
            }
        }
    };


    const handleKeyboardClick = () => {
        setKeyboardVisible(!keyboardVisible);
    };

    const handleKeyboardInput = (input) => {
        setInputText(input);
    };

    const handleKeyPress = (button) => {
        if (button === "{space}") {
            setInputText((prevText) => prevText + " ");
        } else if (button === "{language}") {
            const layouts = ["default", "arabic", "japanese", "korean", "chinese", "russian"];
            const currentIndex = layouts.indexOf(layout);
            const nextLayout = layouts[(currentIndex + 1) % layouts.length];
            setLayout(nextLayout);
        }
    };

    return (
        <>
            <div><Toaster /></div>
            <div className='main-outer'>
                <div className='main-outer1'>
                    <AppBar position="fixed" className="app-bar">
                        <Toolbar className="styled-toolbar">
                            <div className="bar-logo">
                                Tercüman
                            </div>
                            <div className="styled-right-toolbar">
                                <Autocomplete
                                    id="model-select"
                                    sx={{ width: '30%' }}
                                    options={models}
                                    disableClearable
                                    getOptionLabel={(option) => option.label}
                                    value={models.find((c) => c.code.toLowerCase() === selectedModel)}
                                    onChange={(event, newValue) => { setSelectedModel(newValue.code); setSelectedLan1(""); setSelectedLan2(""); }
                                    }
                                    renderInput={(params) => (
                                        <CustomTextField
                                            {...params}
                                            label="Tercüme Modeli"
                                        />
                                    )}
                                />
                            </div>
                        </Toolbar>
                    </AppBar>
                </div>

                <div className='main-outer2-upper'>
                    <div className="main-outer2">
                        <div className='main-inner1'>
                            <div className='main-inner1-1'>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                                    <Autocomplete
                                        id="lan1-select"
                                        sx={{ width: '100%' }}
                                        options={getCountries()}
                                        disableClearable
                                        getOptionLabel={(option) => option.label}
                                        value={getCountries().find((c) => c.code.toLowerCase() === selectedLan1.toLowerCase()) || null}
                                        onChange={(event, newValue) => { if (newValue) setSelectedLan1(newValue.code); }
                                        }
                                        renderInput={(params) => (
                                            <CustomTextField
                                                {...params}
                                                label="Dilinden Çevir"
                                            />
                                        )}
                                    />
                                </ div>
                            </div>
                            <div className='main-inner1-2'>
                                <div className='main-inner1-2-text-box' style={{ position: "relative" }}>
                                    <CustomTextField
                                        id="outlined-multiline-static"
                                        label="Metin girin"
                                        multiline
                                        fullWidth
                                        rows={10}
                                        defaultValue={inputText}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    <IconButton
                                        onClick={handleKeyboardClick}
                                        className="copy-icon"
                                        style={{
                                            margin: "13px",
                                        }}
                                    >
                                        {
                                            !keyboardVisible ?
                                                <KeyboardIcon />
                                                :
                                                <KeyboardHideIcon />
                                        }
                                    </IconButton>

                                    {/* Floating Keyboard */}
                                    {keyboardVisible && (
                                        <div style={{ position: "absolute", width: '90%', margin: '20px 0px 0px 20px', zIndex: 3, color: 'black' }}>
                                            <KeyboardComponent
                                                onChange={handleKeyboardInput}
                                                onKeyPress={handleKeyPress}
                                                layout={{
                                                    default: [
                                                        "q w e r t y u ı o p ğ ü",
                                                        "a s d f g h j k l ş i ä",
                                                        "z x c v b n m ö ç ß {bksp}",
                                                        "{space} {language}"
                                                    ],
                                                    arabic: [
                                                        "ض ص ث ق ف غ ع ه خ ح ج د",
                                                        "ش س ي ب ل ا ت ن م ك ط",
                                                        "ئ ء ؤ ر ى ة و ز ظ {bksp}",
                                                        "{space} {language}"
                                                    ],
                                                    japanese: [
                                                        "あ い う え お か き く け",
                                                        "こ さ し す せ そ た ち つ",
                                                        "て と な に ぬ ね の {bksp}",
                                                        "{space} {language}"
                                                    ],
                                                    korean: [
                                                        "ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ",
                                                        "ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ",
                                                        "ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {bksp}",
                                                        "{space} {language}"
                                                    ],
                                                    chinese: [
                                                        "我 是 中 国 人 你 好",
                                                        "天 气 很 好 今 天 快 乐",
                                                        "学 习 汉 字 非 常 有 意 思 {bksp}",
                                                        "{space} {language}"
                                                    ],
                                                    russian: [
                                                        "й ц у к е н г ш щ з х ъ",
                                                        "ф ы в а п р о л д ж э",
                                                        "я ч с м и т ь б ю {bksp}",
                                                        "{space} {language}"
                                                    ],
                                                }}
                                                display={{
                                                    "{bksp}": "⌫",
                                                    "{space}": " ",
                                                    "{language}": "🌐",
                                                }}
                                                theme={"hg-theme-default hg-layout-default"}
                                                layoutName={layout}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Tooltip title="Dilleri Değiştir">
                            <IconButton style={{ margin: '0px 20px' }} onClick={handleSwitchLan} >
                                <RepeatIcon style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
                            </IconButton>
                        </Tooltip>

                        <div className='main-inner2'>
                            <div className='main-inner2-1'>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                                    <Autocomplete
                                        id="lan2-select"
                                        sx={{ width: '100%' }}
                                        disableClearable
                                        options={getCountriesSource()}
                                        getOptionLabel={(option) => option.label}
                                        value={getCountriesSource().find((c) => c.code.toLowerCase() === selectedLan2.toLowerCase()) || null}
                                        onChange={(event, newValue) => {
                                            if (newValue) setSelectedLan2(newValue.code);
                                        }}
                                        renderInput={(params) => (
                                            <CustomTextField
                                                {...params}
                                                label="Diline Çevir"
                                            />
                                        )}
                                    />

                                </div>
                            </div>

                            <div className='main-inner2-2'>
                                <div className='main-inner2-2-text-box'>
                                    <CustomTextField
                                        id="outlined-multiline-static"
                                        multiline
                                        disabled
                                        fullWidth
                                        rows={10}
                                        value={translation}
                                        InputProps={{
                                            endAdornment: (
                                                <Tooltip title="Kopyala">
                                                    <IconButton onClick={handleCopy} className="copy-icon">
                                                        <FileCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            ),
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button className='button-class' variant="text" onClick={handleTranslate}>Çevir</Button>

                <footer className='footer'>
                    <div>
                        &copy; {new Date().getFullYear()} SSTEK
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Translate;


const models = [
    { code: 'nllb', label: 'NLLB (Mul-Mul) / 202 Dil' },
    { code: 'm2m100', label: 'M2M100 (Mul-Mul) / 100 Dil' },
    { code: 'mbart50', label: 'mBART50 (Mul-Mul) / 52 Dil' },
    { code: 'helsinkinlp', label: 'Opus MT (Mul-İng) 103 Dil' }
]

const countries_mbart50 = [
    { code: 'ar_AR', label: 'Arapça' },
    { code: 'cs_CZ', label: 'Çekçe' },
    { code: 'de_DE', label: 'Almanca' },
    { code: 'en_XX', label: 'İngilizce' },
    { code: 'es_XX', label: 'İspanyolca' },
    { code: 'et_EE', label: 'Estonca' },
    { code: 'fi_FI', label: 'Fince' },
    { code: 'fr_XX', label: 'Fransızca' },
    { code: 'gu_IN', label: 'Gujarati' },
    { code: 'hi_IN', label: 'Hintçe' },
    { code: 'it_IT', label: 'İtalyanca' },
    { code: 'ja_XX', label: 'Japonca' },
    { code: 'kk_KZ', label: 'Kazakça' },
    { code: 'ko_KR', label: 'Korece' },
    { code: 'lt_LT', label: 'Litvanca' },
    { code: 'lv_LV', label: 'Letonca' },
    { code: 'my_MM', label: 'Burma Dili' },
    { code: 'ne_NP', label: 'Nepalce' },
    { code: 'nl_XX', label: 'Flemenkçe' },
    { code: 'ro_RO', label: 'Romence' },
    { code: 'ru_RU', label: 'Rusça' },
    { code: 'si_LK', label: 'Seylanca' },
    { code: 'tr_TR', label: 'Türkçe' },
    { code: 'vi_VN', label: 'Vietnamca' },
    { code: 'zh_CN', label: 'Çince' },
    { code: 'af_ZA', label: 'Afrikaanca' },
    { code: 'az_AZ', label: 'Azerice' },
    { code: 'bn_IN', label: 'Bengalce' },
    { code: 'fa_IR', label: 'Farsça' },
    { code: 'he_IL', label: 'İbranice' },
    { code: 'hr_HR', label: 'Hırvatça' },
    { code: 'id_ID', label: 'Endonezce' },
    { code: 'ka_GE', label: 'Gürcüce' },
    { code: 'km_KH', label: 'Kmerce' },
    { code: 'mk_MK', label: 'Makedonca' },
    { code: 'ml_IN', label: 'Malayalam' },
    { code: 'mn_MN', label: 'Moğolca' },
    { code: 'mr_IN', label: 'Marathi' },
    { code: 'pl_PL', label: 'Lehçe' },
    { code: 'ps_AF', label: 'Peştuca' },
    { code: 'pt_XX', label: 'Portekizce' },
    { code: 'sv_SE', label: 'İsveççe' },
    { code: 'sw_KE', label: 'Svahili' },
    { code: 'ta_IN', label: 'Tamilce' },
    { code: 'te_IN', label: 'Telugu' },
    { code: 'th_TH', label: 'Tayca' },
    { code: 'tl_XX', label: 'Tagalogca' },
    { code: 'uk_UA', label: 'Ukraynaca' },
    { code: 'ur_PK', label: 'Urduca' },
    { code: 'xh_ZA', label: 'Xhosa' },
    { code: 'gl_ES', label: 'Galiçyaca' },
    { code: 'sl_SI', label: 'Slovence' }
];

const countries_m2m100 = [
    { code: 'af', label: 'Afrikaans' },
    { code: 'am', label: 'Amharca' },
    { code: 'ar', label: 'Arapça' },
    { code: 'ast', label: 'Asturyasça' },
    { code: 'az', label: 'Azerice' },
    { code: 'ba', label: 'Başkurtça' },
    { code: 'be', label: 'Belarusça' },
    { code: 'bg', label: 'Bulgarca' },
    { code: 'bn', label: 'Bengalce' },
    { code: 'br', label: 'Bretonca' },
    { code: 'bs', label: 'Boşnakça' },
    { code: 'ca', label: 'Katalanca' },
    { code: 'ceb', label: 'Cebuano' },
    { code: 'cs', label: 'Çekçe' },
    { code: 'cy', label: 'Galce' },
    { code: 'da', label: 'Danca' },
    { code: 'de', label: 'Almanca' },
    { code: 'el', label: 'Yunanca' },
    { code: 'en', label: 'İngilizce' },
    { code: 'es', label: 'İspanyolca' },
    { code: 'et', label: 'Estonyaca' },
    { code: 'fa', label: 'Farsça' },
    { code: 'ff', label: 'Fulaca' },
    { code: 'fi', label: 'Fince' },
    { code: 'fr', label: 'Fransızca' },
    { code: 'fy', label: 'Batı Frizcesi' },
    { code: 'ga', label: 'İrlandaca' },
    { code: 'gd', label: 'İskoç Gaelcesi' },
    { code: 'gl', label: 'Galiçyaca' },
    { code: 'gu', label: 'Güceratça' },
    { code: 'ha', label: 'Hausaca' },
    { code: 'he', label: 'İbranice' },
    { code: 'hi', label: 'Hintçe' },
    { code: 'hr', label: 'Hırvatça' },
    { code: 'ht', label: 'Haiti Kreyolu' },
    { code: 'hu', label: 'Macarca' },
    { code: 'hy', label: 'Ermenice' },
    { code: 'id', label: 'Endonezce' },
    { code: 'ig', label: 'İgbo' },
    { code: 'ilo', label: 'Iloko' },
    { code: 'is', label: 'İzlandaca' },
    { code: 'it', label: 'İtalyanca' },
    { code: 'ja', label: 'Japonca' },
    { code: 'jv', label: 'Cava Dili' },
    { code: 'ka', label: 'Gürcüce' },
    { code: 'kk', label: 'Kazakça' },
    { code: 'km', label: 'Kmerce' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ko', label: 'Korece' },
    { code: 'lb', label: 'Lüksemburgca' },
    { code: 'lg', label: 'Ganda' },
    { code: 'ln', label: 'Lingala' },
    { code: 'lo', label: 'Laoca' },
    { code: 'lt', label: 'Litvanca' },
    { code: 'lv', label: 'Letonca' },
    { code: 'mg', label: 'Malgazca' },
    { code: 'mk', label: 'Makedonca' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'mn', label: 'Moğolca' },
    { code: 'mr', label: 'Marathi' },
    { code: 'ms', label: 'Malayca' },
    { code: 'my', label: 'Burmaca' },
    { code: 'ne', label: 'Nepalce' },
    { code: 'nl', label: 'Felemenkçe' },
    { code: 'no', label: 'Norveççe' },
    { code: 'ns', label: 'Kuzey Sotho' },
    { code: 'oc', label: 'Oksitanca' },
    { code: 'or', label: 'Oriya' },
    { code: 'pa', label: 'Pencapça' },
    { code: 'pl', label: 'Lehçe' },
    { code: 'ps', label: 'Peştuca' },
    { code: 'pt', label: 'Portekizce' },
    { code: 'ro', label: 'Rumence' },
    { code: 'ru', label: 'Rusça' },
    { code: 'sd', label: 'Sindhî' },
    { code: 'si', label: 'Sinhala' },
    { code: 'sk', label: 'Slovakça' },
    { code: 'sl', label: 'Slovence' },
    { code: 'so', label: 'Somalice' },
    { code: 'sq', label: 'Arnavutça' },
    { code: 'sr', label: 'Sırpça' },
    { code: 'ss', label: 'Swati' },
    { code: 'su', label: 'Sundaca' },
    { code: 'sv', label: 'İsveççe' },
    { code: 'sw', label: 'Svahili' },
    { code: 'ta', label: 'Tamilce' },
    { code: 'th', label: 'Tayca' },
    { code: 'tl', label: 'Tagalog' },
    { code: 'tn', label: 'Tsvana' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'uk', label: 'Ukraynaca' },
    { code: 'ur', label: 'Urduca' },
    { code: 'uz', label: 'Özbekçe' },
    { code: 'vi', label: 'Vietnamca' },
    { code: 'wo', label: 'Wolof' },
    { code: 'xh', label: 'Xhosa' },
    { code: 'yi', label: 'Yidiş' },
    { code: 'yo', label: 'Yorubaca' },
    { code: 'zh', label: 'Çince' },
    { code: 'zu', label: 'Zuluca' }
];

const countries_nllb = [
    { code: 'ace_Arab', label: 'Açece (Arapça)' },
    { code: 'ace_Latn', label: 'Açece (Latin)' },
    { code: 'acm_Arab', label: 'Mezopotamya Arapçası' },
    { code: 'acq_Arab', label: 'Ta\'izzi-Adeni Arapçası' },
    { code: 'aeb_Arab', label: 'Tunus Arapçası' },
    { code: 'afr_Latn', label: 'Afrikaans' },
    { code: 'ajp_Arab', label: 'Güney Levanten Arapçası' },
    { code: 'aka_Latn', label: 'Akan' },
    { code: 'amh_Ethi', label: 'Amharca' },
    { code: 'apc_Arab', label: 'Kuzey Levanten Arapçası' },
    { code: 'arb_Arab', label: 'Standart Arapça' },
    { code: 'ars_Arab', label: 'Necd Arapçası' },
    { code: 'ary_Arab', label: 'Fas Arapçası' },
    { code: 'arz_Arab', label: 'Mısır Arapçası' },
    { code: 'asm_Beng', label: 'Assamca' },
    { code: 'ast_Latn', label: 'Asturyasça' },
    { code: 'awa_Deva', label: 'Awadhi' },
    { code: 'ayr_Latn', label: 'Aymara' },
    { code: 'azb_Arab', label: 'Güney Azerice' },
    { code: 'azj_Latn', label: 'Kuzey Azerice' },
    { code: 'bak_Cyrl', label: 'Başkurtça' },
    { code: 'bam_Latn', label: 'Bambara' },
    { code: 'ban_Latn', label: 'Bali Dili' },
    { code: 'bel_Cyrl', label: 'Belarusça' },
    { code: 'bem_Latn', label: 'Bemba' },
    { code: 'ben_Beng', label: 'Bengalce' },
    { code: 'bho_Deva', label: 'Bhojpuri' },
    { code: 'bjn_Arab', label: 'Banjar (Arapça)' },
    { code: 'bjn_Latn', label: 'Banjar (Latin)' },
    { code: 'bod_Tibt', label: 'Tibetçe' },
    { code: 'bos_Latn', label: 'Boşnakça' },
    { code: 'bug_Latn', label: 'Bugis Dili' },
    { code: 'bul_Cyrl', label: 'Bulgarca' },
    { code: 'cat_Latn', label: 'Katalanca' },
    { code: 'ceb_Latn', label: 'Cebuano' },
    { code: 'ces_Latn', label: 'Çekçe' },
    { code: 'cjk_Latn', label: 'Chokwe' },
    { code: 'ckb_Arab', label: 'Orta Kürtçe' },
    { code: 'crh_Latn', label: 'Kırım Tatarcası' },
    { code: 'cym_Latn', label: 'Galce' },
    { code: 'dan_Latn', label: 'Danca' },
    { code: 'deu_Latn', label: 'Almanca' },
    { code: 'dik_Latn', label: 'Güneybatı Dinka' },
    { code: 'dyu_Latn', label: 'Dyula' },
    { code: 'dzo_Tibt', label: 'Dzongkha' },
    { code: 'ell_Grek', label: 'Yunanca' },
    { code: 'eng_Latn', label: 'İngilizce' },
    { code: 'epo_Latn', label: 'Esperanto' },
    { code: 'est_Latn', label: 'Estonyaca' },
    { code: 'eus_Latn', label: 'Baskça' },
    { code: 'ewe_Latn', label: 'Ewe' },
    { code: 'fao_Latn', label: 'Faroe Dili' },
    { code: 'pes_Arab', label: 'İran Farsçası' },
    { code: 'fij_Latn', label: 'Fiji Dili' },
    { code: 'fin_Latn', label: 'Fince' },
    { code: 'fon_Latn', label: 'Fon' },
    { code: 'fra_Latn', label: 'Fransızca' },
    { code: 'fur_Latn', label: 'Friuli Dili' },
    { code: 'fuv_Latn', label: 'Nijerya Fulfulde' },
    { code: 'gla_Latn', label: 'İskoç Galcesi' },
    { code: 'gle_Latn', label: 'İrlandaca' },
    { code: 'glg_Latn', label: 'Galiçyaca' },
    { code: 'grn_Latn', label: 'Guarani' },
    { code: 'guj_Gujr', label: 'Güceratça' },
    { code: 'hat_Latn', label: 'Haiti Kreyolu' },
    { code: 'hau_Latn', label: 'Hausa' },
    { code: 'heb_Hebr', label: 'İbranice' },
    { code: 'hin_Deva', label: 'Hintçe' },
    { code: 'hne_Deva', label: 'Chhattisgarhi' },
    { code: 'hrv_Latn', label: 'Hırvatça' },
    { code: 'hun_Latn', label: 'Macarca' },
    { code: 'hye_Armn', label: 'Ermenice' },
    { code: 'ibo_Latn', label: 'İgbo' },
    { code: 'ilo_Latn', label: 'Iloko' },
    { code: 'ind_Latn', label: 'Endonezce' },
    { code: 'isl_Latn', label: 'İzlandaca' },
    { code: 'ita_Latn', label: 'İtalyanca' },
    { code: 'jav_Latn', label: 'Cava Dili' },
    { code: 'jpn_Jpan', label: 'Japonca' },
    { code: 'kab_Latn', label: 'Kabile' },
    { code: 'kac_Latn', label: 'Jingpho' },
    { code: 'kam_Latn', label: 'Kamba' },
    { code: 'kan_Knda', label: 'Kannada' },
    { code: 'kas_Arab', label: 'Keşmirce (Arapça)' },
    { code: 'kas_Deva', label: 'Keşmirce (Devanagari)' },
    { code: 'kat_Geor', label: 'Gürcüce' },
    { code: 'knc_Arab', label: 'Orta Kanuri (Arapça)' },
    { code: 'knc_Latn', label: 'Orta Kanuri (Latin)' },
    { code: 'kaz_Cyrl', label: 'Kazakça' },
    { code: 'kbp_Latn', label: 'Kabiyè' },
    { code: 'kea_Latn', label: 'Kabuverdianu' },
    { code: 'khm_Khmr', label: 'Kmerce' },
    { code: 'kik_Latn', label: 'Kikuyu' },
    { code: 'kin_Latn', label: 'Kinyarwanda' },
    { code: 'kir_Cyrl', label: 'Kırgızca' },
    { code: 'kmb_Latn', label: 'Kimbundu' },
    { code: 'kon_Latn', label: 'Kikongo' },
    { code: 'kor_Hang', label: 'Korece' },
    { code: 'kmr_Latn', label: 'Kuzey Kürtçe' },
    { code: 'lao_Laoo', label: 'Laoca' },
    { code: 'lvs_Latn', label: 'Letonca' },
    { code: 'lij_Latn', label: 'Ligurya Dili' },
    { code: 'lim_Latn', label: 'Limburgca' },
    { code: 'lin_Latn', label: 'Lingala' },
    { code: 'lit_Latn', label: 'Litvanca' },
    { code: 'lmo_Latn', label: 'Lombardca' },
    { code: 'ltg_Latn', label: 'Latgalya Dili' },
    { code: 'ltz_Latn', label: 'Lüksemburgca' },
    { code: 'lua_Latn', label: 'Luba-Katanga' },
    { code: 'lug_Latn', label: 'Ganda' },
    { code: 'luo_Latn', label: 'Luo' },
    { code: 'lus_Latn', label: 'Mizo' },
    { code: 'mag_Deva', label: 'Magahi' },
    { code: 'mai_Deva', label: 'Maithili' },
    { code: 'mal_Mlym', label: 'Malayalam' },
    { code: 'mar_Deva', label: 'Marathi' },
    { code: 'min_Latn', label: 'Minangkabau' },
    { code: 'mkd_Cyrl', label: 'Makedonca' },
    { code: 'plt_Latn', label: 'Plato Malgaşçası' },
    { code: 'mlt_Latn', label: 'Maltaca' },
    { code: 'mni_Beng', label: 'Manipuri' },
    { code: 'khk_Cyrl', label: 'Halh Moğolcası' },
    { code: 'mos_Latn', label: 'Mossi' },
    { code: 'mri_Latn', label: 'Maori' },
    { code: 'zsm_Latn', label: 'Standart Malayca' },
    { code: 'mya_Mymr', label: 'Burmaca' },
    { code: 'nld_Latn', label: 'Felemenkçe' },
    { code: 'nno_Latn', label: 'Norveç Nynorsk' },
    { code: 'nob_Latn', label: 'Norveç Bokmål' },
    { code: 'npi_Deva', label: 'Nepalce' },
    { code: 'nso_Latn', label: 'Pedi' },
    { code: 'nus_Latn', label: 'Nuer' },
    { code: 'nya_Latn', label: 'Chichewa' },
    { code: 'oci_Latn', label: 'Oksitanca' },
    { code: 'gaz_Latn', label: 'Batı Merkez Oromo' },
    { code: 'ory_Orya', label: 'Odia' },
    { code: 'pag_Latn', label: 'Pangasinan' },
    { code: 'pan_Guru', label: 'Pencapça' },
    { code: 'pap_Latn', label: 'Papiamento' },
    { code: 'pol_Latn', label: 'Lehçe' },
    { code: 'por_Latn', label: 'Portekizce' },
    { code: 'prs_Arab', label: 'Darice' },
    { code: 'pbt_Arab', label: 'Güney Peştuca' },
    { code: 'quy_Latn', label: 'Ayacucho Quechua' },
    { code: 'ron_Latn', label: 'Rumence' },
    { code: 'run_Latn', label: 'Rundi' },
    { code: 'rus_Cyrl', label: 'Rusça' },
    { code: 'sag_Latn', label: 'Sango' },
    { code: 'san_Deva', label: 'Sanskrit' },
    { code: 'sat_Beng', label: 'Santali' },
    { code: 'scn_Latn', label: 'Sicilyaca' },
    { code: 'shn_Mymr', label: 'Shan' },
    { code: 'sin_Sinh', label: 'Sinhala' },
    { code: 'slk_Latn', label: 'Slovakça' },
    { code: 'slv_Latn', label: 'Slovence' },
    { code: 'smo_Latn', label: 'Samoaca' },
    { code: 'sna_Latn', label: 'Shona' },
    { code: 'snd_Arab', label: 'Sindhî' },
    { code: 'som_Latn', label: 'Somalice' },
    { code: 'sot_Latn', label: 'Güney Sotho' },
    { code: 'spa_Latn', label: 'İspanyolca' },
    { code: 'als_Latn', label: 'Tosk Arnavutçası' },
    { code: 'srd_Latn', label: 'Sardunya Dili' },
    { code: 'srp_Cyrl', label: 'Sırpça' },
    { code: 'ssw_Latn', label: 'Swati' },
    { code: 'sun_Latn', label: 'Sundaca' },
    { code: 'swe_Latn', label: 'İsveççe' },
    { code: 'swh_Latn', label: 'Svahili' },
    { code: 'szl_Latn', label: 'Silezyaca' },
    { code: 'tam_Taml', label: 'Tamilce' },
    { code: 'tat_Cyrl', label: 'Tatarca' },
    { code: 'tel_Telu', label: 'Telugu' },
    { code: 'tgk_Cyrl', label: 'Tacikçe' },
    { code: 'tgl_Latn', label: 'Tagalog' },
    { code: 'tha_Thai', label: 'Tayca' },
    { code: 'tir_Ethi', label: 'Tigrinya' },
    { code: 'taq_Latn', label: 'Tamaşek (Latin)' },
    { code: 'taq_Tfng', label: 'Tamaşek (Tifinag)' },
    { code: 'tpi_Latn', label: 'Tok Pisin' },
    { code: 'tsn_Latn', label: 'Tsvana' },
    { code: 'tso_Latn', label: 'Tsonga' },
    { code: 'tuk_Latn', label: 'Türkmence' },
    { code: 'tum_Latn', label: 'Tumbuka' },
    { code: 'tur_Latn', label: 'Türkçe' },
    { code: 'twi_Latn', label: 'Twi' },
    { code: 'tzm_Tfng', label: 'Orta Atlas Tamazight' },
    { code: 'uig_Arab', label: 'Uygurca' },
    { code: 'ukr_Cyrl', label: 'Ukraynaca' },
    { code: 'umb_Latn', label: 'Umbundu' },
    { code: 'urd_Arab', label: 'Urduca' },
    { code: 'uzn_Latn', label: 'Özbekçe' },
    { code: 'vec_Latn', label: 'Venedikçe' },
    { code: 'vie_Latn', label: 'Vietnamca' },
    { code: 'war_Latn', label: 'Waray' },
    { code: 'wol_Latn', label: 'Wolof' },
    { code: 'xho_Latn', label: 'Xhosa' },
    { code: 'ydd_Hebr', label: 'Doğu Yidiş' },
    { code: 'yor_Latn', label: 'Yorubaca' },
    { code: 'yue_Hant', label: 'Kantonca' },
    { code: 'zho_Hans', label: 'Çince (Basitleştirilmiş)' },
    { code: 'zho_Hant', label: 'Çince (Geleneksel)' },
    { code: 'zul_Latn', label: 'Zuluca' }
];

const countries_helsinkinlp = [
    { code: "af", label: "Afrikaanca" },
    { code: "am", label: "Amharca" },
    { code: "ar", label: "Arapça" },
    { code: "ast", label: "Asturyasça" },
    { code: "az", label: "Azerice" },
    { code: "ba", label: "Başkurtça" },
    { code: "be", label: "Beyaz Rusça" },
    { code: "bg", label: "Bulgarca" },
    { code: "bn", label: "Bengalce" },
    { code: "br", label: "Bretonca" },
    { code: "bs", label: "Boşnakça" },
    { code: "ca", label: "Katalanca" },
    { code: "ceb", label: "Sebuanaca" },
    { code: "cs", label: "Çekçe" },
    { code: "cy", label: "Galce" },
    { code: "da", label: "Danca" },
    { code: "de", label: "Almanca" },
    { code: "el", label: "Yunanca" },
    
    { code: "eo", label: "Esperanto" },
    { code: "es", label: "İspanyolca" },
    { code: "et", label: "Estonca" },
    { code: "eu", label: "Baskça" },
    { code: "fa", label: "Farsça" },
    { code: "fi", label: "Fince" },
    { code: "fr", label: "Fransızca" },
    { code: "fy", label: "Frizce" },
    { code: "ga", label: "İrlandaca" },
    { code: "gl", label: "Galiçyaca" },
    { code: "gu", label: "Gujarati" },
    { code: "ha", label: "Hausa" },
    { code: "he", label: "İbranice" },
    { code: "hi", label: "Hintçe" },
    { code: "hr", label: "Hırvatça" },
    { code: "ht", label: "Haitice" },
    { code: "hu", label: "Macarca" },
    { code: "hy", label: "Ermenice" },
    { code: "id", label: "Endonezce" },
    { code: "ig", label: "İbo" },
    { code: "is", label: "İzlandaca" },
    { code: "it", label: "İtalyanca" },
    { code: "ja", label: "Japonca" },
    { code: "jv", label: "Cava Dili" },
    { code: "ka", label: "Gürcüce" },
    { code: "kk", label: "Kazakça" },
    { code: "km", label: "Kmerce" },
    { code: "kn", label: "Kannada" },
    { code: "ko", label: "Korece" },
    { code: "ku", label: "Kürtçe" },
    { code: "ky", label: "Kırgızca" },
    { code: "lb", label: "Lüksemburgca" },
    { code: "lo", label: "Laoca" },
    { code: "lt", label: "Litvanca" },
    { code: "lv", label: "Letonca" },
    { code: "mg", label: "Malgaşça" },
    { code: "mi", label: "Maori" },
    { code: "mk", label: "Makedonca" },
    { code: "ml", label: "Malayalam" },
    { code: "mn", label: "Moğolca" },
    { code: "mr", label: "Marathi" },
    { code: "ms", label: "Malayca" },
    { code: "mt", label: "Maltaca" },
    { code: "my", label: "Burma Dili" },
    { code: "ne", label: "Nepalce" },
    { code: "nl", label: "Flemenkçe" },
    { code: "no", label: "Norveççe" },
    { code: "ny", label: "Çiçevaca" },
    { code: "or", label: "Oriya" },
    { code: "pa", label: "Pencapça" },
    { code: "pl", label: "Lehçe" },
    { code: "ps", label: "Peştuca" },
    { code: "pt", label: "Portekizce" },
    { code: "ro", label: "Romence" },
    { code: "ru", label: "Rusça" },
    { code: "rw", label: "Ruandaca" },
    { code: "sd", label: "Sindhi" },
    { code: "si", label: "Seylanca" },
    { code: "sk", label: "Slovakça" },
    { code: "sl", label: "Slovence" },
    { code: "sm", label: "Samoaca" },
    { code: "sn", label: "Şonaca" },
    { code: "so", label: "Somalice" },
    { code: "sq", label: "Arnavutça" },
    { code: "sr", label: "Sırpça" },
    { code: "st", label: "Sesotho" },
    { code: "su", label: "Sundanca" },
    { code: "sv", label: "İsveççe" },
    { code: "sw", label: "Svahili" },
    { code: "ta", label: "Tamilce" },
    { code: "te", label: "Telugu" },
    { code: "tg", label: "Tacikçe" },
    { code: "th", label: "Tayca" },
    { code: "tl", label: "Tagalogca" },
    { code: "tr", label: "Türkçe" },
    { code: "uk", label: "Ukraynaca" },
    { code: "ur", label: "Urduca" },
    { code: "uz", label: "Özbekçe" },
    { code: "vi", label: "Vietnamca" },
    { code: "xh", label: "Xhosa" },
    { code: "yi", label: "Yidişçe" },
    { code: "yo", label: "Yorubaca" },
    { code: "zh", label: "Çince" },
    { code: "zu", label: "Zulu" }
];