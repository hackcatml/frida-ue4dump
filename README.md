# frida-ue4dump
UE4 dump frida script for UE >= 4.23 64bit<br>
Heavily based on [UE4Dumper](https://github.com/kp7742/UE4Dumper)<br>
Tested on the games listed below. It might not work correctly with other games unless you fix the offsets in script.js
* NIGHT CROWS (Android, iOS, UE5? seems fine)
* Arena Breakout (KR, CN) (Android, iOS)
* Odin, Vahalla Rising (Android, iOS)
* Real Boxing 2 (Android, iOS)
* Mortal Kombat (Android)
* Dislyte (Android)
* Octopath Traveler: Champions of the Continent (Android, iOS)
* Torchlight: Infinite (Android, iOS)
* Black Clover Mobile (KR, JP) (Android, iOS)
* Tower of Fantasy (Android, iOS)
* 아스달 연대기: 세개의 세력 (Arthdal Chronicles) (Android, iOS)
* 아키에이지 워 (ArcheAge War) (Android)
* 명조: 워더링 웨이브 (Wuthering Waves) (Android, iOS)

# Usage
1. Attach
- Real Device
```
frida -Ul script.js <UE4 Game>
```
- Emulator
```
frida -Ul script.js --realm=emulated <UE4 Game>
```

2. Set
```
Call set(<moduleName>) on terminal(ex. set("libUE4.so"))

It will set moduleBase, GUObjectArray, GName
If it cannot find GUObjectArray, GName, need to provide those values manually
```

3. Dump
```
dumpSdk()
```

![image](https://github.com/hackcatml/frida-ue4dump/assets/75507443/080cb6ee-8e60-4a45-97e9-ac36a440b136)



# Credits
* [UE4Dumper](https://github.com/kp7742/UE4Dumper)
* [AndUE4Dumper](https://github.com/MJx0/AndUE4Dumper)
