import React, { useContext, useEffect } from "react";
import axios from "axios";
import api from "../api/api";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import "./Header.css";
import { LoginContext } from "../state/LoginProvider";

const Header = () => {
  const { isLogin, setIsLogin, logincheck, userInfo } =
    useContext(LoginContext);
  const navigate = useNavigate();
  const username = userInfo?.username?.split("_")[0] || "unknown";
  console.log(username);

  const LoginPageClick = () => {
    navigate(`/LoginPage`);
  };

  const googleLogout = async () => {
    const check = window.confirm("로그아웃 하시겠습니까 ?");

    if (check) {
      try {
        const response = await axios.post("/googleLogout");
        if (response.data) {
          Cookies.remove("accessToken");
          alert("로그아웃 성공!");
          setIsLogin(false);
          navigate("/");
        } else {
          console.error("로그아웃 실패");
        }
      } catch (error) {
        console.error("로그아웃 실패:", error.response?.data || error.message);
      }
    }
  };

  const kakaoLogout = async () => {
    const check = window.confirm("로그아웃 하시겠습니까 ?");

    if (check) {
      try {
        console.log(userInfo?.username);
        const response = await axios.post(`/kakaoLogout/${userInfo?.username}`);
        const data = response.data;

        if (data) {
          // 로그아웃 응답 성공 값은 사용자의 kakao id 값 ( Long 타입 )

          Cookies.remove("accessToken");
          alert("로그아웃 성공!");
          setIsLogin(false);
          navigate("/");
          console.log("로그아웃 성공:", response.data);
        } else {
          console.log("로그아웃 실패 ..");
        }
      } catch (error) {
        console.error("로그아웃 실패:", error.response?.data || error.message);
      }
    }
  };

  const naverLogout = async () => {
    const accessToken = Cookies.get("accessToken");
    console.log(`Access Token: ${accessToken}`);

    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    const check = window.confirm("로그아웃 하시겠습니까 ?");

    if (check) {
      try {
        console.log(userInfo?.username);
        const response = await axios.post(
          "/naverLogout",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = response.data;

        if (data) {
          Cookies.remove("accessToken");
          alert("로그아웃 성공!");
          setIsLogin(false);
          navigate("/");
          console.log("로그아웃 성공:", response.data);
        } else {
          console.log("로그아웃 실패 ..");
        }
      } catch (error) {
        console.error("로그아웃 실패:", error.response?.data || error.message);
      }
    }
  };

  const handleLogout = () => {
    if (username === "kakao") {
      kakaoLogout();
    } else if (username === "google") {
      googleLogout();
    } else if (username === "naver") {
      naverLogout();
    } else {
      alert("알 수 없는 사용자입니다.");
    }
  };

  useEffect(() => {
    logincheck();
  }, []);

  return (
    <header>
      <div className="logo">
        <Link to="/">
          <span className="logo-text">My캘린더</span>
        </Link>
      </div>

      {!isLogin ? (
        <div className="login-container" onClick={LoginPageClick}>
          <FaRegUser className="menu-icon" />
          <span className="header-login-text">로그인</span>
        </div>
      ) : (
        <div className="login-container" onClick={handleLogout}>
          <p className="loginName">
            <span style={{ color: "red" }}>환영합니다</span> "{userInfo?.name}(
            {userInfo?.username}) 님"
          </p>
          <FaRegUser className="menu-icon" />
          <span className="header-login-text">로그아웃</span>
        </div>
      )}
    </header>
  );
};

export default Header;
