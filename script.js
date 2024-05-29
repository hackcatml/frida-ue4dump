var moduleBase;
var appId;
var GUObjectArray;
var GName;

var nameIds = [];
var enumClasses = [];
var enumClassStr = "";
var platform = Process.platform;
var arch = Process.arch;
var isBeforeUE425 = false;
var isActorDump = false;

var O_RDONLY = 0;
var SEEK_SET = 0;
var open = new NativeFunction(Module.findExportByName(null, "open"), "int", ["pointer", "int", "int"])
var close = new NativeFunction(Module.findExportByName(null, "close"), "int", ["int"]);
var lseek = new NativeFunction(Module.findExportByName(null, "lseek"), "int", ["int", "int", "int"]);
var read = new NativeFunction(Module.findExportByName(null, "read"), "int", ["int", "pointer", "int"]);

// Global
var FUObjectItemPadd = 0x0;
var FUObjectItemSize = 0x18;
// SDK
var offset_FUObjectArray_TUObjectArray = 0x10;
var offset_TUObjectArray_NumElements = 0x14;
// FNamePool
var FNameStride = 0x2
var offset_GName_FNamePool = platform == "linux" ? 0x30 : 0xc0;
var offset_FNamePool_CurrentBlock = 0x8;
var offset_FNamePool_CurrentByteCursor = 0xc;
var offset_FNamePool_Blocks = 0x10;
// FNameEntry
var offset_FNameEntry_Info = 0;
var FNameEntry_LenBit = 6;
var offset_FNameEntry_String = 0x2;
//Class: UObject
var offset_UObject_InternalIndex = 0xC;
var offset_UObject_ClassPrivate = 0x10;
var offset_UObject_FNameIndex = 0x18;
var offset_UObject_OuterPrivate = 0x20;
//Class: UField
var offset_UField_Next = 0x28;
//Class: UStruct
var offset_UStruct_SuperStruct = 0x40;
var offset_UStruct_Children = 0x48;
var offset_UStruct_ChildProperties = 0x50;
//Class: FField
var offset_FField_Class = 0x8;
var offset_FField_Next = 0x20;
var offset_FField_Name = 0x28;
//Class: UEnum
var offset_UENum_Names = null;
var offset_UENum_Count = null;
var offset_UENum_Max = null;
var enumItemSize = null;
//Class: UFunction
var offset_UFunction_FunctionFlags = 0xb0;
var offset_UFunction_Func = offset_UFunction_FunctionFlags + 0x28;
//Class: UProperty (FProperty in UE4.25+)
var offset_UProperty_ElementSize = 0x38;
var offset_UProperty_PropertyFlags = 0x40;
var offset_UProperty_OffsetInternal = 0x4c;
var offset_UProperty_size = 0x78;
//Class: UBoolProperty
var offset_UBoolProperty_FieldSize = null;
var offset_UBoolProperty_ByteOffset = null;
var offset_UBoolProperty_ByteMask = null;
var offset_UBoolProperty_FieldMask = null;
//Class: UObjectProperty
var offset_UObjectProperty_PropertyClass = null;
//Class: UClassProperty
var offset_UClassProperty_MetaClass = null;
//Class: UInterfaceProperty
var offset_UInterfaceProperty_InterfaceClass = null;
//Class: UArrayProperty
var offset_UArrayProperty_InnerProperty = null;
//Class: UMapProperty
var offset_UMapProperty_KeyProp = null;
var offset_UMapProperty_ValueProp = null;
//Class: USetProperty
var offset_USetProperty_ElementProp = null;
//Class: UStructProperty
var offset_UStructProperty_Struct = null;
//Class: UEnumProperty
var offset_UEnumProperty_EnumClass = null;
//Class: UWorld
var offset_UWorld_PersistentLevel = 0x30;
//Class: ULevel
var offset_ULevel_AActors = 0x98;
var offset_ULevel_AActorsCount = 0xA0;

function setOffsetProperty(offset_UProperty_size) {
    offset_UBoolProperty_FieldMask = offset_UProperty_size + 0x3
    offset_UBoolProperty_ByteMask = offset_UBoolProperty_FieldMask - 0x1;
    offset_UBoolProperty_ByteOffset = offset_UBoolProperty_ByteMask - 0x1;
    offset_UBoolProperty_FieldSize = offset_UBoolProperty_ByteOffset - 0x1;

    offset_UObjectProperty_PropertyClass = offset_UProperty_size;

    offset_UClassProperty_MetaClass = offset_UProperty_size + Process.pointerSize;
    
    offset_UInterfaceProperty_InterfaceClass = offset_UProperty_size;
    
    offset_UArrayProperty_InnerProperty = offset_UProperty_size;
    
    offset_UMapProperty_KeyProp = offset_UProperty_size;
    offset_UMapProperty_ValueProp = offset_UProperty_size + Process.pointerSize;
    
    offset_USetProperty_ElementProp = offset_UProperty_size;
    
    offset_UStructProperty_Struct = offset_UProperty_size;

    offset_UEnumProperty_EnumClass = offset_UProperty_size + Process.pointerSize;
}

function setOffset(appId) {
    // Mortal Kombat(Android) offsets from AndUE4Dumper(https://github.com/MJx0/AndUE4Dumper)
    if (appId === "com.wb.goog.mkx") {
        isBeforeUE425 = false;
        // FNamePool
        FNameStride = 0x4
        // FNameEntry
        offset_FNameEntry_Info = 0x4;
        FNameEntry_LenBit = 1;
        offset_FNameEntry_String = 0x6;
        //Class: UField
        offset_UField_Next = 0x30;
        //Class: UObject
        offset_UObject_OuterPrivate = 0x28;
        //Class: UStruct
        offset_UStruct_SuperStruct = 0x48;
        offset_UStruct_Children = 0x50;
        offset_UStruct_ChildProperties = 0x58;
        //Class: UFunction
        offset_UFunction_FunctionFlags = 0xb8;
        offset_UFunction_Func = offset_UFunction_FunctionFlags + 0x28;
        //Class: UProperty
        offset_UProperty_ElementSize = 0x3c;
        offset_UProperty_size = 0x80;
        //UEnum
        offset_UENum_Names = 0x48;
        offset_UENum_Count = offset_UENum_Names + Process.pointerSize;
        offset_UENum_Max = offset_UENum_Count + 0x4;
        enumItemSize = 0x18;
        setOffsetProperty(offset_UProperty_size);
    } else if (appId === "com.vividgames.realboxing2" || appId === "com.kakaogames.odin" || appId === "com.kakaogames.twodin") {    // Real Boxing 2, Odin Vahalla Rising. UE4.24.3
        isBeforeUE425 = true;
        //Class: UStruct
        offset_UStruct_SuperStruct = 0x40;
        offset_UStruct_Children = 0x48;
        // no need before UE4.25
        offset_UStruct_ChildProperties = 0x0;
        //Class: UFunction
        offset_UFunction_FunctionFlags = 0x98;
        offset_UFunction_Func = offset_UFunction_FunctionFlags + 0x28;
        //Class: UProperty
        offset_UProperty_ElementSize = 0x34;
        offset_UProperty_PropertyFlags = 0x38;
        offset_UProperty_OffsetInternal = 0x44;
        offset_UProperty_size = 0x70;
        //UEnum
        offset_UENum_Names = 0x40;
        offset_UENum_Count = offset_UENum_Names + Process.pointerSize;
        offset_UENum_Max = offset_UENum_Count + 0x4;
        enumItemSize = 0x10;
        setOffsetProperty(offset_UProperty_size);
    } else if (appId === "com.farlightgames.xgame.gp.kr") { // Dislyte(Android) from AndUE4Dumper(https://github.com/MJx0/AndUE4Dumper)
        isBeforeUE425 = true;
        //Class: UStruct
        offset_UStruct_SuperStruct = 0x40;
        offset_UStruct_Children = 0x48;
        offset_UStruct_ChildProperties = 0x0;
        //Class: UFunction
        offset_UFunction_FunctionFlags = 0x98;
        offset_UFunction_Func = offset_UFunction_FunctionFlags + 0x28;
        //Class: UProperty
        offset_UProperty_ElementSize = 0x34;
        offset_UProperty_PropertyFlags = 0x38;
        offset_UProperty_OffsetInternal = 0x44;
        offset_UProperty_size = 0x70;
        //UEnum
        offset_UENum_Names = 0x40;
        offset_UENum_Count = offset_UENum_Names + Process.pointerSize;
        offset_UENum_Max = offset_UENum_Count + 0x4;
        enumItemSize = 0x10;
        setOffsetProperty(offset_UProperty_size);
    } else if (appId === 'com.farlightgames.farlight84.iosglobal' || appId === 'com.miraclegames.farlight84' || appId === 'com.proximabeta.mf.uamo' || appId === 'com.wemade.nightcrows' || appId === 'com.ncsoft.lineagew' || appId === 'com.netease.octopath.kr' || appId === 'com.xd.TLglobal' || appId === 'com.vic.bc.kr' || appId ==='com.vic.bc.jp' || appId === "com.perfect.tof.gp" || appId === "com.tof.ios" || appId === 'com.netmarble.arthdal' || appId === 'com.kakaogames.archewar') {    // farlight 84(UE > 4.25), Arena Breakout, Night Crows, LineageW, octopath traveler, torchlight infinite, Black Clover Mobile (kr), Tower of Fantasy, Arthdal Chronicles, ArcheAge War
        //UEnum
        offset_UENum_Names = 0x40;
        offset_UENum_Count = offset_UENum_Names + Process.pointerSize;
        offset_UENum_Max = offset_UENum_Count + 0x4;
        enumItemSize = 0x10;
        setOffsetProperty(offset_UProperty_size);  
    } else if (appId === 'com.netease.ma100asia' || appId === 'com.netease.dbdena' || appId === 'com.kurogame.wutheringwaves.global') { // Dead by Daylight, Wuthering Waves (UE > 4.25)
        // FNamePool
        FNameStride = 0x4
        // FNameEntry
        offset_FNameEntry_Info = 0x4;
        FNameEntry_LenBit = 1;
        offset_FNameEntry_String = 0x6;
        //Class: UStruct
        offset_UStruct_SuperStruct = 0x48;
        offset_UStruct_Children = 0x50;
        offset_UStruct_ChildProperties = 0x58;
        //Class: UFunction
        offset_UFunction_FunctionFlags = 0xb8;
        offset_UFunction_Func = offset_UFunction_FunctionFlags + 0x28;
        //Class: UProperty
        offset_UProperty_ElementSize = 0x3c;
        offset_UProperty_PropertyFlags = 0x40;
        offset_UProperty_OffsetInternal = 0x4c;
        offset_UProperty_size = 0x80;
        //UEnum
        offset_UENum_Names = 0x48;
        offset_UENum_Count = offset_UENum_Names + Process.pointerSize;
        offset_UENum_Max = offset_UENum_Count + 0x4;
        enumItemSize = 0x18;
        setOffsetProperty(offset_UProperty_size);
    } else {    // default
        setOffsetProperty(offset_UProperty_size);
    }   
}

var UObject = {
    getClass: function(obj) {
        var classPrivate = ptr(obj).add(offset_UObject_ClassPrivate).readPointer();
        // console.log(`classPrivate: ${classPrivate}`);
        return classPrivate;
    },
    getNameId: function(obj) {
        // console.log(`obj: ${obj}`);
        try {
            var nameId = ptr(obj).add(offset_UObject_FNameIndex).readU32();
            // console.log(`nameId: ${nameId}`);
            return nameId;
        } catch(e) {
            return 0;
        }
    },
    getName: function(obj) {
        if (this.isValid(obj)){
            return getFNameFromID(this.getNameId(obj));
        } else {
            return "None";
        }
    },
    getClassName: function(obj) {
        if (this.isValid(obj)) {
            var classPrivate = this.getClass(obj);
            return this.getName(classPrivate);
        } else {
            return "None";
        }
    },
    isValid: function(obj) {
        var isValid = (ptr(obj) > 0 && this.getNameId(obj) > 0 && this.getClass(obj) > 0);
        // console.log(`isValid: ${isValid}`);
        return isValid;
    }
}

var UField = {
    getNext: function(field) {//UField*
        // console.log(`field: ${field}`);
        return field.add(offset_UField_Next).readPointer();
    }
};

var FField = {
    getName: function(fField) {
        return getFNameFromID(fField.add(offset_FField_Name).readU32());
    },
    getClassName: function(fField) {
        return getFNameFromID(fField.add(offset_FField_Class).readPointer().readU32());
    },
    getNext: function(fField) {//UField*
        return fField.add(offset_FField_Next).readPointer();
    }
};

var UStruct = {
    getSuperClass: function(structz) {//UStruct*
        // console.log(`UStruct.getSuperClass structz: ${structz}`);
        return structz.add(offset_UStruct_SuperStruct).readPointer()
    },
    getChildren: function(structz) {//UField*
        // console.log(`UStruct.getChildren structz: ${structz}`);
        return structz.add(offset_UStruct_Children).readPointer();
    },
    getChildProperties: function(structz) {//UField*
        // console.log(`UStruct.getChildProperties structz: ${structz}`);
        return structz.add(offset_UStruct_ChildProperties).readPointer();
    },
    getClassName: function(clazz) {
        return UObject.getName(clazz);
    },
    getClassPath: function(object) {
        var clazz = UObject.getClass(object);
        var classname = UObject.getName(clazz);

        var superclass = this.getSuperClass(clazz);
        while (UObject.isValid(superclass)) {
            classname += ".";
            classname += UObject.getName(superclass);

            superclass = this.getSuperClass(superclass);
        }

        return classname;
    },
    getStructClassPath: function(clazz) {
        var classname = UObject.getName(clazz);

        var superclass = this.getSuperClass(clazz);
        while (UObject.isValid(superclass)) {
            // console.log(`superclass: ${superclass}`)
            classname += ".";
            classname += UObject.getName(superclass);

            superclass = this.getSuperClass(superclass);
        }

        return classname;
    }
}

var UFunction = {
    getFunctionFlags: function(func) {
        return func.add(offset_UFunction_FunctionFlags).readU32();
    },
    getFunc: function(func) {
        // console.log(`func: ${func}`)
        return func.add(offset_UFunction_Func).readPointer();
    }
};

var UProperty = {
    getElementSize: function(prop) {
        return prop.add(offset_UProperty_ElementSize).readU32();
    },
    getPropertyFlags: function(prop) {
        return prop.add(offset_UProperty_PropertyFlags).readU64()
    },
    getOffset: function(prop) {
        return prop.add(offset_UProperty_OffsetInternal).readU32();
    }
};

var UBoolProperty = {
    getFieldSize: function(prop) {
        return prop.add(offset_UBoolProperty_FieldSize).readU8();
    },
    getByteOffset: function(prop) {
        // console.log(`prop: ${prop}`)
        return prop.add(offset_UBoolProperty_ByteOffset).readU8();
    },
    getByteMask: function(prop) {
        return prop.add(offset_UBoolProperty_ByteMask).readU8();
    },
    getFieldMask: function(prop) {
        return prop.add(offset_UBoolProperty_FieldMask).readU8();
    },
};

var UObjectProperty = {
    getPropertyClass: function(prop) {//class UClass*
        return prop.add(offset_UObjectProperty_PropertyClass).readPointer();
    }
};

var UClassProperty = {
    getMetaClass: function(prop) {//class UClass*
        return prop.add(offset_UClassProperty_MetaClass).readPointer();
    }
};

var UInterfaceProperty = {
    getInterfaceClass: function(prop) {//class UClass*
        return prop.add(offset_UInterfaceProperty_InterfaceClass).readPointer();
    }
};

var UArrayProperty = {
    getInner: function(prop) {//UProperty*
        return prop.add(offset_UArrayProperty_InnerProperty).readPointer();
    }
};

var UMapProperty = {
    getKeyProp: function(prop) {//UProperty*
        return prop.add(offset_UMapProperty_KeyProp).readPointer();
    },
    getValueProp: function(prop) {//UProperty*
        return prop.add(offset_UMapProperty_ValueProp).readPointer();
    }
};

var USetProperty = {
    getElementProp: function(prop) {//UProperty*
        return prop.add(offset_USetProperty_ElementProp).readPointer();
    }
};

var UStructProperty = {
    getStruct: function(prop) {//UStruct*
        return prop.add(offset_UStructProperty_Struct).readPointer();
    }
};

var UEnum = {
    getNamesArray: function(en) {
        return en.add(offset_UENum_Names).readPointer();
    },
    getCount: function(en) {
        return en.add(offset_UENum_Count).readU32();
    }
}

var UEnumProperty = {
    getEnum: function(prop) {
        return prop.add(offset_UEnumProperty_EnumClass).readPointer();
    },
    getName: function(prop) {
        return UObject.getName(this.getEnum(prop));
    }
}

var UByteProperty = {
    getEnum: function(prop) {
        return prop.add(offset_UProperty_size).readPointer();
    },
    getName: function(prop) {
        return UObject.getName(this.getEnum(prop));
    }
}

function getFNameFromID(index) {
    var Block = index >> 16;
    var Offset = index & 65535;

    var FNamePool = GName.add(offset_GName_FNamePool);
    // console.log(`FNamePool: ${FNamePool}`);
    // console.log(`Block: ${Block}`);
    var NamePoolChunk = FNamePool.add(offset_FNamePool_Blocks + Block * Process.pointerSize).readPointer();
    // console.log(`NamePoolChunk: ${NamePoolChunk}`);
    var FNameEntry = NamePoolChunk.add(FNameStride * Offset);
    // console.log(`FNameEntry: ${FNameEntry}`);
    try {
        if (offset_FNameEntry_Info !== 0) {
            var FNameEntryHeader = FNameEntry.add(offset_FNameEntry_Info).readU16();     
        } else {
            var FNameEntryHeader = FNameEntry.readU16();
        }
    } catch(e) {
        // console.log(e);
        return "";
    }
    // console.log(`FNameEntryHeader: ${FNameEntryHeader}`);
    var str_addr = FNameEntry.add(offset_FNameEntry_String);
    // console.log(`str_addr: ${str_addr}`);
    var str_length = FNameEntryHeader >> FNameEntry_LenBit;
    var wide = FNameEntryHeader & 1;
    if (wide) return "widestr";

    if (str_length > 0 && str_length < 250) {
        var str = str_addr.readUtf8String(str_length);
        return str;
    } else {
        return "None";
    }
}

function getUObjectBaseObjectFromId(index) {
    var TUObjectArray = GUObjectArray.add(offset_FUObjectArray_TUObjectArray).readPointer();
    // console.log(`TUObjectArray: ${TUObjectArray}`)
    var chunk = TUObjectArray.add(parseInt(index / 0x10000) * Process.pointerSize);
    var FUObjectItemObjects = chunk.readPointer();
    // console.log(`FUObjectItemObjects: ${FUObjectItemObjects}`);
    var UObjectBaseObject = FUObjectItemObjects.add(FUObjectItemPadd + (index % 0x10000) * FUObjectItemSize).readPointer();
    // console.log(`UObjectBaseObject: ${UObjectBaseObject}`);
    return UObjectBaseObject;
}

function resolveProp(recurrce, prop) {
    if (prop) {
        if (isBeforeUE425) {
            var cname = UObject.getClassName(prop);
        } else {
            var cname = FField.getClassName(prop);
        }
        // console.log(`resolveProp cname: ${cname}`);

        if (cname === "ObjectProperty" || cname === "WeakObjectProperty"
            || cname === "LazyObjectProperty" || cname === "AssetObjectProperty"
            || cname === "SoftObjectProperty") {
            var propertyClass = UObjectProperty.getPropertyClass(prop);
            recurrce.push(...[propertyClass]);
            return UObject.getName(propertyClass) + "*";
        } else if (cname === "ClassProperty" || cname === "AssetClassProperty" ||
                   cname === "SoftClassProperty") {
            var metaClass = UClassProperty.getMetaClass(prop);
            recurrce.push(...[metaClass]);
            return "class " + UObject.getName(metaClass);
        } else if (cname === "InterfaceProperty") {
            var interfaceClass = UInterfaceProperty.getInterfaceClass(prop);
            recurrce.push(...[interfaceClass]);
            return "interface class" + UObject.getName(interfaceClass);
        } else if (cname === "StructProperty") {
            var Struct = UStructProperty.getStruct(prop);
            // console.log(`StructProperty addr: ${Struct}`);
            recurrce.push(...[Struct]);
            return UObject.getName(Struct);
        } else if (cname === "ArrayProperty") {
            return resolveProp(recurrce, UArrayProperty.getInner(prop)) + "[]";
        } else if (cname === "SetProperty") {
            return "<" + resolveProp(recurrce, USetProperty.getElementProp(prop)) + ">";
        } else if (cname === "MapProperty") {
            return "<" + resolveProp(recurrce, UMapProperty.getKeyProp(prop)) + "," +
                   resolveProp(recurrce, UMapProperty.getValueProp(prop)) + ">";
        } else if (cname === "BoolProperty") {
            return "bool";
        } else if (cname === "ByteProperty") {
            var enumObj = UByteProperty.getEnum(prop);
            if (offset_UENum_Names !== null && UObject.isValid(enumObj)) {
                var enumName = UByteProperty.getName(prop);
                if (!enumClasses.includes(enumName)) {
                    enumClasses.push(enumName);
                    enumClassStr += "enum " + enumName + " {";
                    for (var count = 0; count < UEnum.getCount(enumObj); count++) {
                        var index = UEnum.getNamesArray(enumObj).add(count * enumItemSize).readU32();
                        enumClassStr += "\n\t" + getFNameFromID(index).replace(enumName + "::", "")
                    }
                    enumClassStr += "\n};\n";
                    return "enum " + enumName;
                } else {
                    return "enum " + enumName;
                }
            } else {
                return "byte";
            }
        } else if (cname === "IntProperty") {
            return "int";
        } else if (cname === "Int8Property") {
            return "int8";
        } else if (cname === "Int16Property") {
            return "int16";
        } else if (cname === "Int64Property") {
            return "int64";
        } else if (cname === "UInt16Property") {
            return "uint16";
        } else if (cname === "UInt32Property") {
            return "uint32";
        } else if (cname === "UInt64Property") {
            return "uint64";
        } else if (cname === "DoubleProperty") {
            return "double";
        } else if (cname === "FloatProperty") {
            return "float";
        } else if (cname === "EnumProperty") {
            var enumName = UEnumProperty.getName(prop);
            if (offset_UENum_Names !== null) {
                var enumObj = UEnumProperty.getEnum(prop);
                if (!enumClasses.includes(enumName)) {
                    enumClasses.push(enumName);
                    enumClassStr += "enum " + enumName + " {";
                    for (var count = 0; count < UEnum.getCount(enumObj); count++) {
                        var index = UEnum.getNamesArray(enumObj).add(count * enumItemSize).readU32();
                        enumClassStr += "\n\t" + getFNameFromID(index).replace(enumName + "::", "")
                    }
                    enumClassStr += "\n};\n";
                    return "enum " + enumName;
                } else {
                    return "enum " + enumName;
                }
            } else {
                return "enum " + enumName;
            }
        } else if (cname === "StrProperty") {
            return "FString";
        } else if (cname === "TextProperty") {
            return "FText";
        } else if (cname === "NameProperty") {
            return "FName";
        } else if (cname === "DelegateProperty" || cname === "MulticastDelegateProperty") {
            return "delegate";
        } else {
            if (isBeforeUE425) {
                return UObject.getName(prop) + "(" + cname + ")";
            } else {
                return FField.getName(prop) + "(" + cname + ")";
            }
        }
    }
    return "NULL";
}

function writeStructChild(childprop) {
    var recurrce = [];
    var child = childprop;
    // console.log(`writeStructChild child before validation: ${child}`);
    while (UObject.isValid(child)) {
        var prop = child;
        if (isBeforeUE425) {
            var oname = UObject.getName(prop);
            var cname = UObject.getClassName(prop);    
        } else {
            var oname = FField.getName(prop);
            var cname = FField.getClassName(prop);
        }
        // console.log(`writeStructChild child after validation: ${child}`);
        // console.log(`oname: ${oname}, cname: ${cname}`);
        if (cname === "ObjectProperty" || cname === "WeakObjectProperty" || cname === "LazyObjectProperty" || cname === "AssetObjectProperty" || cname === "SoftObjectProperty") {
            var propertyClass = UObjectProperty.getPropertyClass(prop);
            console.log(`\t${UObject.getName(propertyClass)}* ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
            recurrce.push(propertyClass);
        } else if (cname === "ClassProperty" || cname === "AssetClassProperty" || cname === "SoftClassProperty") {
            var metaClass = UClassProperty.getMetaClass(prop);
            console.log(`\tclass ${UObject.getName(metaClass)}* ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
            recurrce.push(metaClass);
        } else if (cname === "InterfaceProperty") {
            var interfaceClass = UInterfaceProperty.getInterfaceClass(prop);
            console.log(`\tinterface class ${UObject.getName(interfaceClass)}* ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`)
        } else if (cname === "StructProperty") {
            var Struct = UStructProperty.getStruct(prop);
            console.log(`\t${UObject.getName(Struct)} ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
            recurrce.push(Struct);
        } else if (cname === "ArrayProperty") {
            console.log(`\t${resolveProp(recurrce, UArrayProperty.getInner(prop))}[] ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "SetProperty") {
            console.log(`\t${resolveProp(recurrce, USetProperty.getElementProp(prop))} ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "MapProperty") {
            console.log(`\t<${resolveProp(recurrce, UMapProperty.getKeyProp(prop))}, ${resolveProp(recurrce, UMapProperty.getValueProp(prop))}> ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "BoolProperty") {
            console.log(`\tbool ${oname} //(ByteOffset: ${ptr(UBoolProperty.getByteOffset(prop))}, ByteMask: ${UBoolProperty.getByteMask(prop)}, FieldMask: ${UBoolProperty.getFieldMask(prop)}) [Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "ByteProperty") {
            var enumObj = UByteProperty.getEnum(prop);
            if (offset_UENum_Names !== null && UObject.isValid(enumObj)) {
                var enumName = UByteProperty.getName(prop);
                console.log(`\tenum ${enumName} ${oname} { //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
                for (var count = 0; count < UEnum.getCount(enumObj); count++) {
                    var index = UEnum.getNamesArray(enumObj).add(count * enumItemSize).readU32();
                    console.log(`\t\t${getFNameFromID(index).replace(enumName + "::", "")}`)
                }
                console.log("\t};")
            } else {
                console.log(`\tbyte ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
            }
        } else if (cname === "IntProperty") {
            console.log(`\tint ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "Int8Property") {
            console.log(`\tint8 ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "Int16Property") {
            console.log(`\tint16 ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "Int64Property") {
            console.log(`\tint64 ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "UInt16Property") {
            console.log(`\tint16 ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "UInt32Property") {
            console.log(`\tint32 ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "UInt64Property") {
            console.log(`\tint64 ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "DoubleProperty") {
            console.log(`\tdouble ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "FloatProperty") {
            console.log(`\tfloat ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "EnumProperty") {
            var enumName = UEnumProperty.getName(prop);
            if (offset_UENum_Names !== null) {
                var enumObj = UEnumProperty.getEnum(prop);
                console.log(`\tenum ${enumName} ${oname} { //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
                for (var count = 0; count < UEnum.getCount(enumObj); count++) {
                    var index = UEnum.getNamesArray(enumObj).add(count * enumItemSize).readU32();
                    console.log(`\t\t${getFNameFromID(index).replace(enumName + "::", "")}`)
                }
                console.log("\t};")
            } else {
                console.log(`\tenum ${enumName} ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
            }
        } else if (cname === "StrProperty") {
            console.log(`\tFString ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "TextProperty") {
            console.log(`\tFText ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "NameProperty") {
            console.log(`\tFName ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "DelegateProperty" || cname === "MulticastDelegateProperty" || cname === "MulticastInlineDelegateProperty" || cname === "MulticastSparseDelegateProperty") {
            console.log(`\tdelegate ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (cname === "XigPtrProperty") {
            console.log(`\tXigPtrProperty ${oname}; //[Offset: ${ptr(UProperty.getOffset(prop))}, Size: ${UProperty.getElementSize(prop)}]`);
        } else if (isBeforeUE425) {
            if (cname.startsWith("Function") || cname === "DelegateFunction") {
                var returnVal = "void";
                var params = "";
                var flags = "";

                var funcParam = UStruct.getChildren(prop);
                // console.log(`funcParam: ${funcParam});
                while (UObject.isValid(funcParam)) {
                    var PropertyFlags = UProperty.getPropertyFlags(funcParam);
                    // console.log(`PropertyFlags: ${PropertyFlags});
                    if ((PropertyFlags & 0x0000000000000400) == 0x0000000000000400) {
                        returnVal = resolveProp(recurrce, funcParam);
                    } else {
                        if ((PropertyFlags & 0x0000000000000100) == 0x0000000000000100) {
                            params += "out ";
                        }
                        /*if((PropertyFlags & 0x0000000008000000) == 0x0000000008000000){
                            params += "ref ";
                        }*/
                        if ((PropertyFlags & 0x0000000000000002) == 0x0000000000000002) {
                            params += "const ";
                        }
                        // console.log(`funcParam will go in...: ${funcParam});
                        params += resolveProp(recurrce, funcParam);
                        // params += "blahblah";
                        params += " ";
                        params += UObject.getName(funcParam);
                        params += ", ";
                    }

                    funcParam = UField.getNext(funcParam);
                }

                if (params.length > 0) {
                    params = params.slice(0, -2);
                }

                var FunctionFlags = UFunction.getFunctionFlags(prop);
                // console.log(`FunctionFlags: ${FunctionFlags});

                if ((FunctionFlags & 0x00002000) == 0x00002000) {
                    returnVal = "static " + returnVal;
                }
                /*if((FunctionFlags & 0x00000001) == 0x00000001){
                    returnVal = "final " + returnVal;
                }
                if((FunctionFlags & 0x00020000) == 0x00020000){
                    returnVal = "public " + returnVal;
                }
                if((FunctionFlags & 0x00040000) == 0x00040000){
                    returnVal = "private " + returnVal;
                }
                if((FunctionFlags & 0x00080000) == 0x00080000){
                    returnVal = "protected " + returnVal;
                }*/

                for (let mapping of funcFlags) {
                    if ((FunctionFlags & mapping.flag) == mapping.flag) {
                        flags += `${mapping.name}|`
                    }
                }

                console.log(`\t${returnVal} ${oname}(${params}); // ${UFunction.getFunc(prop).sub(moduleBase)} ${flags !== "" ? ("[" + flags.slice(0, -1) + "]") : ""}`);
            } else if (cname === "Class" || cname === "Package") {
            } else {
                console.log(`\t${cname} ${oname}; //[Size: ${UProperty.getElementSize(prop)}]`);
            }
        } else {
            console.log(`\t${cname} ${oname}; //[Size: ${UProperty.getElementSize(prop)}]`);
        }

        if (isBeforeUE425) {
            child = UField.getNext(child);
        } else {
            child = FField.getNext(child);
        }
    }
    return recurrce;
}

var funcFlags = [
    {flag:0x00000001, name: "Final"},   // Function is final (prebindable, non-overridable function).
	{flag:0x00000004, name: "BlueprintAuthorityOly"},   // Function will only run if the object has network authority
	{flag:0x00000008, name: "BlueprinCosmetic"},    // Function is cosmetic in nature and should not be invoked on dedicated servers
	{flag:0x00000400, name: "Native"},  // Native function.
	{flag:0x00000800, name: "Event"},   // Event function.
	{flag:0x00002000, name: "Static"},  // Static function.
    {flag:0x00008000, name: "UbergraphFunction"},   // Function is used as the merge 'ubergraph' for a blueprint, only assigned when using the persistent 'ubergraph' frame
    {flag:0x00010000, name: "MulticastDlegate"},    // Function is a multi-cast delegate signature (also requires FUNC_Delegate to be set!)
    {flag:0x00100000, name: "Delegate"},    // Function is delegate signature (either single-cast or multi-cast, depending on whether FUNC_MulticastDelegate is set.)
    {flag:0x04000000, name: "BlueprintCallabl"},    // function can be called from blueprint code
	{flag:0x08000000, name: "BlueprintEvent"},  // function can be overridden/implemented from a blueprint
	{flag:0x10000000, name: "BlueprintPure"},    // function can be called from blueprint code, and is also pure (produces no side effects). If you set this, you should set FUNC_BlueprintCallable as well.
    {flag:0x20000000, name: "EditorOnly"},  // function can only be called from an editor scrippt.
    {flag:0x40000000, name: "Const"},   // function can be called from blueprint code, and only reads state (never writes state)
]

function writeStructChild_Func(childprop) {
    var recurrce = [];
    var child = childprop;
    // console.log(`child: ${child}`);
    while (UObject.isValid(child)) {
        var prop = child;
        var oname = UObject.getName(prop);
        var cname = UObject.getClassName(prop);
        // console.log(`writeStructChild_Func child: ${child}`);
        // console.log(`cname: ${cname}`);
        if (cname.startsWith("Function") || cname === "DelegateFunction") {
            var returnVal = "void";
            var params = "";
            var flags = "";

            var funcParam = UStruct.getChildProperties(prop);
            // console.log(`funcParam: ${funcParam});
            while (UObject.isValid(funcParam)) {
                var PropertyFlags = UProperty.getPropertyFlags(funcParam);
                // console.log(`PropertyFlags: ${PropertyFlags});
                if ((PropertyFlags & 0x0000000000000400) == 0x0000000000000400) {
                    returnVal = resolveProp(recurrce, funcParam);
                } else {
                    if ((PropertyFlags & 0x0000000000000100) == 0x0000000000000100) {
                        params += "out ";
                    }
                    /*if((PropertyFlags & 0x0000000008000000) == 0x0000000008000000){
                        params += "ref ";
                    }*/
                    if ((PropertyFlags & 0x0000000000000002) == 0x0000000000000002) {
                        params += "const ";
                    }
                    // console.log(`funcParam will go in...: ${funcParam});
                    params += resolveProp(recurrce, funcParam);
                    // params += "blahblah";
                    params += " ";
                    params += FField.getName(funcParam);
                    params += ", ";
                }

                funcParam = FField.getNext(funcParam);
            }

            if (params.length > 0) {
                params = params.slice(0, -2);
            }

            var FunctionFlags = UFunction.getFunctionFlags(prop);
            // console.log(`FunctionFlags: ${FunctionFlags});

            if ((FunctionFlags & 0x00002000) == 0x00002000) {
                returnVal = "static " + returnVal;
            }
            /*if((FunctionFlags & 0x00000001) == 0x00000001){
                returnVal = "final " + returnVal;
            }
            if((FunctionFlags & 0x00020000) == 0x00020000){
                returnVal = "public " + returnVal;
            }
            if((FunctionFlags & 0x00040000) == 0x00040000){
                returnVal = "private " + returnVal;
            }
            if((FunctionFlags & 0x00080000) == 0x00080000){
                returnVal = "protected " + returnVal;
            }*/

            for (let mapping of funcFlags) {
                if ((FunctionFlags & mapping.flag) == mapping.flag) {
                    flags += `${mapping.name}|`
                }
            }

            console.log(`\t${returnVal} ${oname}(${params}); // ${UFunction.getFunc(prop).sub(moduleBase)} ${flags !== "" ? ("[" + flags.slice(0, -1) + "]") : ""}`);
        } else if (cname === "Class" || cname === "Package") {
        } else {
            console.log(`\t${cname} ${oname}; //[Size: ${UProperty.getElementSize(prop)}]`); 
        }

        child = UField.getNext(child);
    }
    return recurrce;
}

function writeStruct(clazz) {
    var recurrce = [];

    var currStruct = clazz;
    while (UObject.isValid(currStruct)) {
        // console.log(`currStruct: ${currStruct}`)
        var name = UObject.getName(currStruct);
        // console.log(`name: ${name}`);
        if (name === "None" || name.indexOf("/Game/") > -1 || name.indexOf("_png") > -1 || name === "") {
            // console.log(`name is ${name} gonna break`);
            break;
        }

        var nameId = UObject.getNameId(currStruct);
        // console.log(nameId);
        if (!nameIds.includes(nameId)) {
            nameIds.push(nameId);
            if (isActorDump) {
                if (UStruct.getStructClassPath(currStruct) === 'Actor.Object') {
                    console.log(`Class: ${UStruct.getStructClassPath(currStruct)} ${currStruct}`)    // for debugging
                    if (isBeforeUE425) {
                        recurrce.push(...writeStructChild(UStruct.getChildren(currStruct)));
                    } else {
                        recurrce.push(...writeStructChild(UStruct.getChildProperties(currStruct)));
                        recurrce.push(...writeStructChild_Func(UStruct.getChildren(currStruct)));
                    }
                }
            } else {
                console.log(`Class: ${UStruct.getStructClassPath(currStruct)}`)
                if (isBeforeUE425) {
                    recurrce.push(...writeStructChild(UStruct.getChildren(currStruct)));
                } else {
                    recurrce.push(...writeStructChild(UStruct.getChildProperties(currStruct)));
                    recurrce.push(...writeStructChild_Func(UStruct.getChildren(currStruct)));
                }
            }
        }
        currStruct = UStruct.getSuperClass(currStruct);
    }
    // console.log(`recurse: ${recurrce}`);
    for (var key in recurrce) {
        writeStruct(recurrce[key]);
    }
}

function dumpActor() {
    isActorDump = true;
    dumpSdk();
}

function dumpObjects() {
    if (GUObjectArray === undefined) {
        console.log(`Do set(<moduleName>) first`);
        return;
    } else if (GUObjectArray === null) {
        console.log(`Provide GUObjectArray address by GUObjectArray = moduleBase.add(<offset of GUObjectArray>);`);
        return;
    }
    var ObjectCount = GUObjectArray.add(offset_FUObjectArray_TUObjectArray).add(offset_TUObjectArray_NumElements).readU32();
    console.log(`ObjectCount: ${ObjectCount}`);

    for (var i = 0; i < ObjectCount; i++) {
        var UObjectBaseObject = getUObjectBaseObjectFromId(i);
        if (UObject.isValid(UObjectBaseObject)) {
            var name = UObject.getName(UObjectBaseObject);
            console.log(`${i}. name: ${name}`);
            var className = UObject.getClassName(UObjectBaseObject);
            console.log(`${i}. class: ${className}`);
        }
    }
}

function dumpSdk() {
    if (GUObjectArray === undefined) {
        console.log(`Do set(<moduleName>) first`);
        return;
    } else if (GUObjectArray === null) {
        console.log(`Provide GUObjectArray address by GUObjectArray = moduleBase.add(<offset of GUObjectArray>);`);
        return;
    }
    var ObjectCount = GUObjectArray.add(offset_FUObjectArray_TUObjectArray).add(offset_TUObjectArray_NumElements).readU32();

    for (var i = 0; i < ObjectCount; i++) {
        var UObjectBaseObject = getUObjectBaseObjectFromId(i);
        if (UObject.isValid(UObjectBaseObject)) {
            // console.log(`UObjectBaseObject: ${UObjectBaseObject}`);
            var clazz = UObject.getClass(UObjectBaseObject);
            writeStruct(clazz);
        }
    }
    if (offset_UENum_Names !== null) console.log(enumClassStr);
}

var GNameSearchCompleted = false;
var GUObjectArraySearchCompleted = false;
var GNamePatternFoundAddr;
var GUObjectArrayPatternFoundAddr;
function scanMemoryForGName(scanStart, scanSize, mempattern) {
    if (GNameSearchCompleted) {
        console.log(`[*] Memory scan done for GName!`);
        if (GNamePatternFoundAddr === undefined) {
            GNamePatternFoundAddr = ptr(0x0);
        }
        return;
    }
    Memory.scan(scanStart, scanSize, mempattern, {
        onMatch: function (address, size) {
            if (GNameSearchCompleted) return;
            GNamePatternFoundAddr = ptr(address);
            GNameSearchCompleted = true;
        },
        onError: function(reason) {
            var newstart = ptr(reason.match(/(0x[0-9a-f]+)/)[1]).add(0x4);
            var newsize = scanSize - parseInt(newstart.sub(scanStart));
            this.error = true;
            scanMemoryForGName(newstart, newsize, mempattern);
        },
        onComplete: function() {
            if (!this.error) {
                GNameSearchCompleted = true;
                scanMemoryForGName(scanStart, scanSize, mempattern);
            }
        }
    })
}

function scanMemoryForGUObjectArray(scanStart, scanSize, mempattern) {
    if (GUObjectArraySearchCompleted) {
        console.log(`[*] Memory scan done for GUObjectArray!`);
        if (GUObjectArrayPatternFoundAddr === undefined) {
            GUObjectArrayPatternFoundAddr = ptr(0x0);
        }
        return;
    }
    Memory.scan(scanStart, scanSize, mempattern, {
        onMatch: function (address, size) {
            if (GUObjectArraySearchCompleted) return;
            GUObjectArrayPatternFoundAddr = ptr(address);

            if (appId === 'com.wemade.nightcrows') {
                var adrp, add;
                var disasm = Instruction.parse(GUObjectArrayPatternFoundAddr);
                adrp = disasm.operands.find(op => op.type === 'imm')?.value;
                
                disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(0x8));
                add = disasm.operands.find(op => op.type === 'imm')?.value;
                
                if (ptr(adrp).add(ptr(add)).readUtf8String() === "CloseDisregardForGC" || ptr(adrp).add(ptr(add)).readUtf8String() === "DisableDisregardForGC") {
                    GUObjectArraySearchCompleted = true;
                }
            }
        },
        onError: function(reason) {
            var newstart = ptr(reason.match(/(0x[0-9a-f]+)/)[1]).add(0x4);
            var newsize = scanSize - parseInt(newstart.sub(scanStart));
            this.error = true;
            scanMemoryForGUObjectArray(newstart, newsize, mempattern);
        },
        onComplete: function() {
            if (!this.error) {
                GUObjectArraySearchCompleted = true;
                scanMemoryForGUObjectArray(scanStart, scanSize, mempattern);
            }
        }
    })
}

// Find GName
function findGName(moduleName) {
    var addr = Module.findExportByName(moduleName, "_Zeq12FNameEntryId5EName");
    if (addr === null) {
        console.log(`[!] Cannot find GName`);
        console.log(`[*] Try to search GName on memory`);
        var module = Process.findModuleByName(moduleName)
        /* Pattern for _Zeq12FNameEntryId5EName func (operator==(FNameEntryId, EName)) 
        hmm...not sure it's a correct pattern. I only checked three simple UE4 games
        */
        var pattern = "?8 ?? ?? ?? 08 01 ?? 91 ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? 08 69 69 b8 1f 01 00 6b e0 17 9f 1a c0 03 5f d6";
        try {
            var match = Memory.scanSync(module.base, module.size, pattern);
        } catch(e) {
            console.log(`[!] error while scanning GName in memory`);
        }
        if (match !== undefined && match.length === 1) {
            console.log(`[*] Found _Zeq12FNameEntryId5EName function address ${match[0].address}`);
            console.log(`[*] Intercept _Zeq12FNameEntryId5EName to get GName`);
            addr = match[0].address;
        } else if (match !== undefined && match.length > 1) {
            console.log(`[!] Found ${match.length} addresses`);
            console.log(`[!] You need to inspect these offsets to find GName`);
            for (var key in match) {
                console.log(`${key}. offset: ${match[key].address.sub(module.base)}`);
            }
            GName = null;
            return;
        } else {
            console.log(`[!] Cannot find GName. Try other pattern`);
            pattern = "c8 00 00 37 ?? ?? ?? ?? 00 00 ?? 91";
            scanMemoryForGName(module.base, module.size, pattern);

            var int = setInterval(() => {
                if (GNamePatternFoundAddr !== undefined && (ptr(GNamePatternFoundAddr) != "0x0")) {
                    console.log(`[*] GName pattern found at ${GNamePatternFoundAddr}`);
                    
                    var adrp, add;
                    let disasm = Instruction.parse(GNamePatternFoundAddr.add(0x4));
                    adrp = disasm.operands.find(op => op.type === 'imm')?.value;
                    
                    disasm = Instruction.parse(GNamePatternFoundAddr.add(0x8));
                    add = disasm.operands.find(op => op.type === 'imm')?.value;
                    
                    try {
                        GName = ptr(adrp).add(ptr(add));
                        console.log(`[*] Got GName: ${GName}`);
                    } catch (e) {
                        console.log(`[!] ${e.stack}`);
                        GName = null;
                    }
                    clearInterval(int);
                    return;
                } else if (GNamePatternFoundAddr !== undefined && (ptr(GNamePatternFoundAddr) == "0x0")) {
                    console.log(`[!] Give up finding GName pattern in memory`);
                    GName = null;
                    clearInterval(int);
                    return;
                }
            }, 1000);
            return;
        }
    } 

    // Intercept operator==(FNameEntryId, EName) func
    Interceptor.attach(addr.add(0x8), {
        onEnter: function(args) {
            // console.log(this.context.x8);
            // console.log(JSON.stringify(this.context.x8).length);
            if (this.context.x8 != ptr(0x0) && JSON.stringify(this.context.x8).length > 10) {
                GName = ptr(this.context.x8);
                console.log(`[*] Got GName: ${GName}`);
                Interceptor.detachAll();
            }
        },
        onLeave: function(retval) {
            // Interceptor.detachAll();
        }
    })
}

// Find GUObjectArray
function findGUObjectArray(moduleName) {
    GUObjectArray = Module.findExportByName(moduleName, "GUObjectArray");
    if (GUObjectArray === null && platform === 'darwin') {
        console.log(`[!] Cannot find GUObjectArray`);
        console.log(`[*] Try to search GUObjectArray on memory`);
        var module = Process.findModuleByName(moduleName);
        /* Pattern for FUObjectArray::AllocateObjectPool(&GUObjectArray, int, int, bool); in UObjectBaseInit()
        hmm...not sure it's a correct pattern and it's too short...maybe it will find more than one address
        */
        var pattern = "e1 ?? 40 b9 e2 ?? 40 b9 e3 ?? 40 39";
        var match = Memory.scanSync(module.base, module.size, pattern);
        if (match.length === 1) {
            GUObjectArrayPatternFoundAddr = match[0].address;
            console.log(`[*] Found FUObjectArray::AllocateObjectPool(&GUObjectArray, int, int, bool) pattern at ${match[0].address}`);

            var adrp, add;
            var disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(0xc));
            adrp = disasm.operands.find(op => op.type === 'imm')?.value;
            
            disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(0x10));
            add = disasm.operands.find(op => op.type === 'imm')?.value;
            
            try {
                GUObjectArray = ptr(adrp).add(ptr(add));
                console.log(`[*] Got GUObjectArray: ${GUObjectArray}`);
            } catch (e) {
                console.log(`[!] ${e.stack}`);
                GUObjectArray = undefined;
            }
        } else if (match.length > 1) {
            console.log(`[!] Found ${match.length} addresses`);
            console.log(`[!] You need to inspect these offsets to find GUObjectArray`);
            for (var key in match) {
                console.log(`${key}. offset: ${match[key].address.sub(module.base)}`);
            }
            GUObjectArray = null;
            return;
        } else {
            console.log(`[!] Cannot find GUObjectArray in memory too. You need to find it by yourself`);
            GUObjectArray = null;
            return;
        }
    } else if (GUObjectArray === null && platform === 'linux') {
        console.log(`[!] Cannot find GUObjectArray`);
        console.log(`[*] Try to search GUObjectArray on memory`);
        var module = Process.findModuleByName(moduleName);
        var pattern = null;
        if (appId === 'com.proximabeta.mf.uamo' || appId === "com.netease.ma100asia" || appId === "com.netease.dbdena" || appId === 'com.netease.octopath.kr' || appId === 'com.vic.bc.kr' || appId === 'com.vic.bc.jp' || appId === "com.perfect.tof.gp" || appId === 'com.netmarble.arthdal' || appId === 'com.miraclegames.farlight84') {
            /* Arena Breakout, Dead by Daylight, Octopath, Black Clover, Tower of Fantasy, Arthdal Chronicles, farlight84 pattern */
            pattern = "?1 ?? ff ?0 ?? ?? ?? ?1 ?? ?? ?3 ?1 ?? ?? ?? 9? ?0 ?? ?? ?0 00 ?? ?? f9"
        } else if (appId === "com.wemade.nightcrows") {
            /* Night Crows pattern */
            pattern = "?1 ?? ff ?0 ?? ?? ?? ?1 21 ?? ?? 91 ?? ?? ?? 9? ?0 ?? ?? ?0 00 ?? ?? f9"
        } else {
            pattern = "e1 ?? 40 b9 e2 ?? 40 b9 e3 ?? 40 39";
        }
        scanMemoryForGUObjectArray(module.base, module.size, pattern);

        var int = setInterval(() => {
            if ((GUObjectArrayPatternFoundAddr !== undefined) && (ptr(GUObjectArrayPatternFoundAddr) != "0x0")) {
                console.log(`[*] GUObjectArray pattern found at ${GUObjectArrayPatternFoundAddr}`);
                if (appId === 'com.proximabeta.mf.uamo' || appId === "com.wemade.nightcrows" || appId === "com.netease.ma100asia" || appId === "com.netease.dbdena" || appId === 'com.netease.octopath.kr' || appId === 'com.xd.TLglobal' || appId === 'com.vic.bc.kr' || appId === 'com.vic.bc.jp' || appId === "com.perfect.tof.gp" || appId === 'com.netmarble.arthdal' || appId === 'com.miraclegames.farlight84') {
                    var adrp, ldr;
                    for (let off = 0;; off += 4) {
                        let disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(off));
                        if (disasm.mnemonic === 'adrp') {
                            adrp = disasm.operands.find(op => op.type === 'imm')?.value;
                        
                            disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(off + 4));
                            if (disasm.mnemonic === 'ldr') {
                                ldr = disasm.operands.find(op => op.type === 'mem')?.value.disp;
                                break; // exit loop after finding the sequence adrp followed by ldr
                            }
                        }
                        if (off == 4 * 10) break;
                    }

                    try {
                        var GUObjectArray_ptr = ptr(adrp).add(ptr(ldr));
                        console.log(`[*] GUObjectArray_ptr: ${GUObjectArray_ptr}`);
                        GUObjectArray = ptr(GUObjectArray_ptr).readPointer();
                        console.log(`[*] Got GUObjectArray: ${GUObjectArray}`);
                    } catch (e) {
                        console.log(`[!] ${e.stack}`);
                        GUObjectArray = undefined;
                    }
                } else if (appId === 'com.miraclegames.farlight84.old') { // Not working for the latest version of farlight84, so I just changed package name by adding the .old suffix
                    var adrp, ldr;
                    let disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.sub(0x4));
                    adrp = disasm.operands.find(op => op.type === 'imm')?.value;
                    
                    disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(0xc));
                    ldr = disasm.operands.find(op => op.type === 'mem')?.value.disp;
                    
                    try {
                        var GUObjectArray_ptr = ptr(adrp).add(ptr(ldr));
                        console.log(`[*] GUObjectArray_ptr: ${GUObjectArray_ptr}`);
                        GUObjectArray = ptr(GUObjectArray_ptr).readPointer();
                        console.log(`[*] Got GUObjectArray: ${GUObjectArray}`);
                    } catch (e) {
                        console.log(`[!] ${e.stack}`);
                        GUObjectArray = undefined;
                    }
                } else {
                    var adrp, add;
                    let disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(0xc));
                    adrp = disasm.operands.find(op => op.type === 'imm')?.value;
                    
                    disasm = Instruction.parse(GUObjectArrayPatternFoundAddr.add(0x10));
                    add = disasm.operands.find(op => op.type === 'imm')?.value;
                    
                    try {
                        GUObjectArray = ptr(adrp).add(ptr(add));
                        console.log(`[*] Got GUObjectArray: ${GUObjectArray}`);
                    } catch (e) {
                        console.log(`[!] ${e.stack}`);
                        GUObjectArray = undefined;
                    }
                }
                clearInterval(int);
                return;
            } else if ((GUObjectArrayPatternFoundAddr !== undefined) && (ptr(GUObjectArrayPatternFoundAddr) == "0x0")) {
                console.log(`[!] Give up finding GUObjectArray pattern in memory`);
                GUObjectArray = undefined;
                clearInterval(int);
                return;
            }
        }, 1000);
    }
}

function findAppId() {
    if (platform === "linux") {
        var path = Memory.allocUtf8String('/proc/self/cmdline');
        var fd = open(path, O_RDONLY, 0);
        if (fd != -1) {
            var buffer = Memory.alloc(0x1000);
            var result = read(fd, buffer, 0x1000);
            close(fd);
            result = ptr(buffer).readCString();
            return result;
        }
        return "dunno.package.name";
    } else {
        return ObjC.classes.NSBundle.mainBundle().bundleIdentifier().toString();
    }
}

/* Find Unreal Engine Version */
/* Need to Parse elf, parse Mach-O for finding unreal engine version */
/* Some variables and functions for elf parsing */
var p_types = {
    "PT_NULL":		0,		/* Program header table entry unused */
    "PT_LOAD":		1,		/* Loadable program segment */
    "PT_DYNAMIC":	2,		/* Dynamic linking information */
    "PT_INTERP":	3,		/* Program interpreter */
    "PT_NOTE":		4,		/* Auxiliary information */
    "PT_SHLIB":	    5,		/* Reserved */
    "PT_PHDR":		6,		/* Entry for header table itself */
    "PT_TLS":		7,		/* Thread-local storage segment */
    "PT_NUM":		8,		/* Number of defined types */
    "PT_LOOS":		0x60000000,	/* Start of OS-specific */
    "PT_GNU_EH_FRAME":	0x6474e550,	/* GCC .eh_frame_hdr segment */
    "PT_GNU_STACK":	0x6474e551,	/* Indicates stack executability */
    "PT_GNU_RELRO":	0x6474e552,	/* Read-only after relocation */
    "PT_GNU_PROPERTY":	0x6474e553,	/* GNU property */
    "PT_LOSUNW":	0x6ffffffa,
    "PT_SUNWBSS":	0x6ffffffa,	/* Sun Specific segment */
    "PT_SUNWSTACK":	0x6ffffffb,	/* Stack segment */
    "PT_HISUNW":	0x6fffffff,
    "PT_HIOS":		0x6fffffff,	/* End of OS-specific */
    "PT_LOPROC":	0x70000000,	/* Start of processor-specific */
    "PT_HIPROC":	0x7fffffff,	/* End of processor-specific */
}

var PT_LOAD_data_offset = null;
var PT_LOAD_data_size = null;
/* Some variables and functions for elf parsing */

/* Parsing ELF */
function parseElf(base) {
    base = ptr(base);
    var module = Process.findModuleByAddress(base);
    var fd = null;
    if (module !== null) {
        fd = open(Memory.allocUtf8String(module.path), O_RDONLY, 0);
    }
    
    // Read elf header
    var magic = "464c457f"
    var elf_magic = base.readU32()
    if (parseInt(elf_magic).toString(16) != magic) {
        console.log("[!] Wrong magic...ignore")
    }

    var arch = Process.arch
    var is32bit = arch == "arm" ? 1 : 0 // 1:32 0:64

    var size_of_Elf32_Ehdr = 0x34;
    var off_of_Elf32_Ehdr_phentsize = 42;
    var off_of_Elf32_Ehdr_phnum = 44;

    var size_of_Elf64_Ehdr = 0x40;
    var off_of_Elf64_Ehdr_phentsize = 54;
    var off_of_Elf64_Ehdr_phnum = 56;

    // Parse Ehdr(Elf header)
    var ehdrs_from_file = null;
    var phoff = is32bit ? size_of_Elf32_Ehdr : size_of_Elf64_Ehdr   // Program header table file offset
    var phentsize = is32bit ? base.add(off_of_Elf32_Ehdr_phentsize).readU16() : base.add(off_of_Elf64_Ehdr_phentsize).readU16();    // Size of entries in the program header table
    if (is32bit && phentsize != 32) {  // 0x20
        console.log("[!] Wrong e_phentsize. Should be 32. Let's assume it's 32");
        phentsize = 32;
    } else if (!is32bit && phentsize != 56) {
        console.log("[!] Wrong e_phentsize. Should be 56. Let's assume it's 56");
        phentsize = 56;
    }
    var phnum = is32bit ? base.add(off_of_Elf32_Ehdr_phnum).readU16() : base.add(off_of_Elf64_Ehdr_phnum).readU16();    // Number of entries in program header table
    // If phnum is 0, try to get it from the file
    if (phnum == 0) {
        if (fd != null && fd !== -1){
            console.log("[!] phnum is 0. Try to get it from the file")
            ehdrs_from_file = Memory.alloc(64);
            lseek(fd, 0, SEEK_SET);
            read(fd, ehdrs_from_file, 64);
            phnum = is32bit ? ehdrs_from_file.add(off_of_Elf32_Ehdr_phnum).readU16() : ehdrs_from_file.add(off_of_Elf64_Ehdr_phnum).readU16();
            if (phnum == 0) {
                console.log("[!] phnum is still 0. Let's assume it's 10. because we just need to find .dynamic section");
                phnum = 10;
            } else {
                console.log(`[*] phnum from the file: ${phnum}`)
            }
        } else {
            console.log("[!] phnum is 0. Let's assume it's 10. because we just need to find .dynamic section")
            phnum = 10;
        }
    }

    // Parse Phdr(Program header)
    var phdrs = base.add(phoff);
    var PT_LOAD_count = 0;
    for (var i = 0; i < phnum; i++) {
        var phdr = phdrs.add(i * phentsize);
        var p_type = phdr.readU32();

        // if p_type is 0 check if it's really 0 from the file
        var phdrs_from_file = null;
        if (p_type === 0 && fd != null && fd !== -1) {
            phdrs_from_file = Memory.alloc(phnum * phentsize);
            lseek(fd, phoff, SEEK_SET);
            read(fd, phdrs_from_file, phnum * phentsize);
            p_type = phdrs_from_file.add(i * phentsize).readU32();
        }
        var p_type_sym = null;

        // check if p_type matches the defined p_type
        var p_type_exists = false;
        for (let key in p_types) {
            if (p_types[key] === p_type) {
                p_type_exists = true;
                p_type_sym = key;
                break;
            }
        }
        if (!p_type_exists) break;

        var p_vaddr = is32bit ? phdr.add(0x8).readU32() : phdr.add(0x10).readU64();
        var p_memsz = is32bit ? phdr.add(0x14).readU32() : phdr.add(0x28).readU64();
        var p_flags = is32bit ? phdr.add(0x18).readU32() : phdr.add(0x4).readU32();

        // if p_flags is 0, check it from the file
        if (p_flags === 0 && fd != null && fd !== -1) {
            phdrs_from_file = Memory.alloc(phnum * phentsize);
            lseek(fd, phoff, SEEK_SET);
            read(fd, phdrs_from_file, phnum * phentsize);
            var phdr_from_file = phdrs_from_file.add(i * phentsize);
            p_vaddr = is32bit ? phdr_from_file.add(0x8).readU32() : phdr_from_file.add(0x10).readU64();
            p_memsz = is32bit ? phdr_from_file.add(0x14).readU32() : phdr_from_file.add(0x28).readU64();
        }

        // The UE version string is in the .bss section, which is covered by the .data section
        // .data section usually starts from the 4th PT_LOAD
        if (p_type_sym === 'PT_LOAD') {
            PT_LOAD_count++;
            PT_LOAD_data_offset = p_vaddr;
            PT_LOAD_data_size = p_memsz;
        }

        if (p_type_sym !== 'PT_LOAD' && PT_LOAD_count >= 4) {
            break;
        }
        // Weird case (Black Clover mobile), just set offset 0x0, size as module's size
        else if (p_type_sym !== 'PT_LOAD' && (PT_LOAD_count >= 1 && PT_LOAD_count < 4)) {
            PT_LOAD_data_offset = 0x0;
            PT_LOAD_data_size = module.size;
            break;
        }
    }
}
/* Parsing ELF */

/* Parsing MachO */
var DATA_segment_data_section_offset = null;
var DATA_segment_data_section_size = null;
function parseMachO(base) {
    base = ptr(base)
    var magic = base.readU32();
    var is64bit = false;
    if (magic == 0xfeedfacf) {
        is64bit = true;
        var number_of_commands_offset = 0x10
        var command_size_offset = 0x4
        var segment_name_offset = 0x8
        var vm_address_offset = 0x18
        var vm_size_offset = 0x20
        var file_offset = 0x28
        var number_of_sections_offset = 0x40
        var section64_header_base_offset = 0x48
        var section64_header_size = 0x50
    } else {
        console.log('Unknown magic:' + magic);
    }
    var cmdnum = base.add(number_of_commands_offset).readU32();
    // send({'parseMachO': {'cmdnum': cmdnum}})
    var cmdoff = is64bit ? 0x20 : 0x1C;
    for (var i = 0; i < cmdnum; i++) {
        var cmd = base.add(cmdoff).readU32();
        var cmdsize = base.add(cmdoff + command_size_offset).readU32();
        if (cmd === 0x19) { // SEGMENT_64
            var segname = base.add(cmdoff + segment_name_offset).readUtf8String();
            var vmaddr = base.add(cmdoff + vm_address_offset).readU32();
            var vmsize = base.add(cmdoff + vm_size_offset).readU32();
            var fileoffset = base.add(cmdoff + file_offset).readU32();
            var nsects = base.add(cmdoff + number_of_sections_offset).readU8();
            var secbase = base.add(cmdoff + section64_header_base_offset);

            if (base.add(cmdoff + command_size_offset).readU32() >= section64_header_base_offset + nsects * section64_header_size) {
                var DATA_segment_data_section_index = null;
                for (var i = 0; i < nsects; i++) {
                    var secname = secbase.add(i * section64_header_size).readUtf8String()
                    var section_start_offset = secbase.add(i * section64_header_size + 0x30).readU32();

                    // The UE version string is in the __DATA segment's __data
                    if (segname === '__DATA' && secname === '__data') {
                        DATA_segment_data_section_index = i;
                        DATA_segment_data_section_offset = section_start_offset;
                    } else if (segname === '__DATA' && DATA_segment_data_section_index != null && i == (DATA_segment_data_section_index + 1)) {
                        DATA_segment_data_section_size = section_start_offset - DATA_segment_data_section_offset;
                        break;
                    }
                }
            }
        }
        if (DATA_segment_data_section_offset != null && DATA_segment_data_section_size != null) {
            break;
        }
        cmdoff += cmdsize;
    }
}
/* Parsing MachO */
/* Need to Parse elf, parse Mach-O for finding unreal engine version */

/* Scan memory for finding Unreal Engine Version */
var UEVersion = null;
var scanMemoryForUEVersionDone = false;
function scanMemoryForUEVersion(scanStart, scanSize, mempattern, module) {
    Memory.scan(scanStart, scanSize, mempattern, {
        onMatch: function (address, size) {
            if (scanMemoryForUEVersionDone) return;
            // console.log(`[!] UE versiong string found at: ${address}`)
            // The address that refers to the address that stores the version string - 0x40 == the address that stores the version string
            if (address.add(0x40).readPointer() == address.toString()) {
                UEVersion = address.readU8().toString() + '.' + address.add(0x2).readU8().toString() + '.' + address.add(0x4).readU8().toString();
                console.log(`[*] UE version: ${UEVersion}`);
                scanMemoryForUEVersionDone = true;
            }
        },
        onComplete: function() {
            if (UEVersion == null) {
                scanMemoryForUEVersion(module.base, module.size, mempattern, module);
            }
            else if (UEVersion != null) {
                scanMemoryForUEVersionDone = true;
            }
        }
    })
}
/* Scan memory for finding Unreal Engine Version */

function findUEVersion(moduleName) {
    var module = Process.findModuleByName(moduleName);
    var UE4_pattern = "04 00 ?? 00 0? 00 00 00";
    var UE5_pattern = "05 00 ?? 00 ?? 00 00 00";
    var scanStart = null;
    var scanSize = null;
    if (Process.platform === 'linux') {
        parseElf(module.base);
        // console.log(PT_LOAD_data_offset);
        // console.log(PT_LOAD_data_size);
        scanStart = module.base.add(PT_LOAD_data_offset);
        scanSize = PT_LOAD_data_size;
    }
    else if (Process.platform === 'darwin') {
        parseMachO(module.base);
        // console.log(DATA_segment_data_section_offset);
        // console.log(DATA_segment_data_section_size);
        scanStart = module.base.add(DATA_segment_data_section_offset);
        scanSize = DATA_segment_data_section_size;
    }
    console.log(`[*] Scan UE Version`);
    scanMemoryForUEVersion(scanStart, scanSize, UE4_pattern, module);
    scanMemoryForUEVersion(scanStart, scanSize, UE5_pattern, module);
}
/* Find Unreal Engine Version */

function set(moduleName) {
    moduleBase = Module.findBaseAddress(moduleName);
    appId = findAppId();
    findUEVersion(moduleName);
    findGUObjectArray(moduleName);
    findGName(moduleName);
    setOffset(appId);

    var int = setInterval(() => {
        if ((GName !== undefined && GName !== null) && (GUObjectArray !== undefined && GUObjectArray !== null)) {
            console.log(`\n[*] set ${moduleName} (${appId})\nbase: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        } else if ((GName !== undefined && GName !== null) && GUObjectArray === undefined) {
            console.log(`\n[*] set ${moduleName} (${appId})\nbase: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        } else if (GName === null && (GUObjectArray !== undefined && GUObjectArray !== null)) {
            console.log(`\n[*] set ${moduleName} (${appId})\nbase: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        } else if (GName === null && GUObjectArray === undefined) {
            console.log(`\n[*] set ${moduleName} (${appId})\nbase: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        }
    }, 0);
}
