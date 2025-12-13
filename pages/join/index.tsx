import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useEffect, useState } from "react";
import { Prism as Pre } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const JoinPage : NextPage = () => {

    const [msg, setMsg] = useState("");
    const [isEmailChanged, setEmailChanged] = useState(false);

    const [defaultNumber, setDefaultNumber] = useState("");
    const [defaultName, setDefaultName] = useState("");
    const [defaultFurigana, setDefaultFurigana] = useState("");
    const [defaultBirthday, setDefaultBirthday] = useState("");
    const [defaultPhone, setDefaultPhone] = useState("");
    const [defaultEmail, setDefaultEmail] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const number = params.get("number");
        const name = params.get("name");
        const furigana = params.get("furigana");
        const birthday = params.get("birthday");
        const phone = params.get("phone");
        const email = params.get("email");

        setDefaultNumber(number || "");
        setDefaultName(name || "");
        setDefaultFurigana(furigana || "");
        setDefaultBirthday(birthday || "");
        setDefaultPhone(phone || "");
        setDefaultEmail(email || "");
    }, []);
    
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                
                <h1>二次入部フォーム</h1>
                <p className={styles.description}>
                    以下の入力は入部届の発行、構成員名簿、部員管理システムに用います。<br />
                    入部届発行後、ハンコを押印し、電子計算研究部、文化会本部、学生自治会のいずれかにご提出ください。
                </p>

                <form>
                    <label>
                        学籍番号
                        <input type="text" name="number" placeholder="20a000" onChange={
                            (e) => {
                                if (e.target.value.startsWith("s")) {
                                    e.target.value = e.target.value.slice(1);
                                }

                                if (isEmailChanged) return;
                                const email = document.getElementById("email") as HTMLInputElement;
                                if (email) {
                                    email.value = "s" + e.target.value + "@ge.osaka-sandai.ac.jp";
                                }

                            }
                        } defaultValue={ defaultNumber } />
                    </label>
                    <label>
                        氏名<br />
                        <input type="text" name="name" placeholder="電研 太郎" onChange={
                            () => {

                            }
                        } defaultValue={ defaultName } />
                    </label><br />
                    <label>
                        フリガナ<br />
                        <input type="text" name="furigana" placeholder="でんけん たろう" defaultValue={ defaultFurigana } />
                    </label><br />
                    <label>
                        生年月日<br />
                        <input type="date" name="birthday" defaultValue={ defaultBirthday } />
                    </label><br />
                    <label>
                        連絡先（携帯）<br />
                        <input type="text" name="phone" placeholder="090-1234-5678" defaultValue={ defaultPhone } />
                    </label><br />
                    <label>
                        メールアドレス<br />
                        <input type="text" id="email" name="email" placeholder="s20a000@ge.osaka-sandai.ac.jp" onChange={
                            (e) => {
                                setEmailChanged(true);
                            }
                        } defaultValue={defaultEmail} />
                    </label><br />

                    <input type="submit" value="送信する" onClick={(e) => {
                        // e.preventDefault();

                    }}/>
                </form>
            </main>
        </div>
    );
};

export default JoinPage;