set PATH=%PATH%;D:\ffmpeg\bin

FOR %%A in (M_J_sM, M_J_sJ, J_M_sJ, J_M_sM, ^
	    A_C_sA, A_C_sC, C_A_sA, C_A_sC, ^
	    B_E_sB, B_E_sE, E_B_sB, E_B_sE, ^
	    L_N_sL, L_N_sN, N_L_sL, N_L_sN, ^
	    start)   ^
DO (ffmpeg -pass 1 -passlogfile %%A.avi -threads 16  -keyint_min 0 -g 250 -skip_threshold 0 -qmin 1 -qmax 51 -i %%A.avi -vcodec libvpx -b 800000 -s 752x288 -aspect 47:18 -an -y NUL
    ffmpeg -pass 2 -passlogfile %%A.avi -threads 16  -keyint_min 0 -g 250 -skip_threshold 0 -qmin 1 -qmax 51 -i %%A.avi -vcodec libvpx -b 800000 -s 752x288 -aspect 47:18 -acodec libvorbis -y %%A.webm
)

