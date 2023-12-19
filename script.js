var moduleBase;
var GUObjectArray;
var GName;

var nameIds = [];
var enumClasses = [];
var enumClassStr = "";
var platform = Process.platform;
var arch = Process.arch;
var isBeforeUE425 = false;
var isActorDump = false;

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
    } else if (appId === 'com.farlightgames.farlight84.iosglobal' || appId === 'com.miraclegames.farlight84' || appId === 'com.proximabeta.mf.uamo' || appId === 'com.wemade.nightcrows' || appId === 'com.ncsoft.lineagew') {    // farlight 84(UE > 4.25), Arena Breakout, Night Crows, LineageW
        //UEnum
        offset_UENum_Names = 0x40;
        offset_UENum_Count = offset_UENum_Names + Process.pointerSize;
        offset_UENum_Max = offset_UENum_Count + 0x4;
        enumItemSize = 0x10;
        setOffsetProperty(offset_UProperty_size);  
    } else if (appId === 'com.netease.ma100asia' || appId === 'com.netease.dbdena') { // Dead by Daylight(UE > 4.25)
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
            GUObjectArraySearchCompleted = true;
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
                    console.log(`[*] Disassemble it using armconvert.com`)
                    var arrayBuff = new Uint8Array(GNamePatternFoundAddr.add(0x4).readByteArray(8));
                    var hex = bytes2hex(arrayBuff);
                    var result = armConvert(hex, GNamePatternFoundAddr.add(0x4).sub(module.base), arch);
                    var adrp = result.match(/adrp.*#([0-9a-fx]+)/)[1];
                    var add = result.match(/add.*#([0-9a-fx]+)/)[1];
                    var offset_GName = ptr(adrp).add(ptr(add));
                    console.log(`[*] offset of GName from the base address: ${offset_GName}`);
                    GName = module.base.add(offset_GName);
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
                Interceptor.detachAll();
            }
        },
        onLeave: function(retval) {
            // Interceptor.detachAll();
        }
    })
}

function bytes2hex(array) {
    var result = '';
    for(var i = 0; i < array.length; ++i) {
        result += ('0' + (array[i] & 0xFF).toString(16)).slice(-2);
    }
    return result;
}

// https://github.com/frida/frida/issues/1158#issuecomment-1227124335
function armConvert(hex, offset, arch) {
    var askStr = '{"hex":"' + hex + '","offset":"' + offset + '","arch":"' + arch + '"}';
    if (platform === 'darwin') {
        // console.log(askStr)
        var str = ObjC.classes.NSString['alloc']()['initWithString:'](askStr.toString());
        var postData = str.dataUsingEncoding_(4);
        // console.log(postData.bytes().readUtf8String(postData.length()));
        var len = str.length;
        var strLength = ObjC.classes.NSString['stringWithFormat:']('%d', len);
        var request = ObjC.classes.NSMutableURLRequest['alloc']()['init']();
        var url = ObjC.classes.NSURL.URLWithString_('https://armconverter.com/api/convert');
        var method = ObjC.classes.NSString['alloc']()['initWithString:']('POST');
        var httpF = ObjC.classes.NSString['alloc']()['initWithString:']('Content-Length');
        var httpL  = ObjC.classes.NSString['alloc']()['initWithString:']('Content-Type');
        request.setURL_(url);
        request.setHTTPMethod_(method);
        request.setValue_forHTTPHeaderField_(strLength,httpF);
        request.setValue_forHTTPHeaderField_("application/json", httpL);
        request.setHTTPBody_(postData);
        var nil = ObjC.Object(ptr("0x0"));
        var resData = ObjC.classes.NSURLConnection['sendSynchronousRequest:returningResponse:error:'](request,nil,nil);
        var resStr = resData.bytes().readUtf8String(resData.length());
        var obj = JSON.parse(resStr);
        var disassemResult = obj.asm.arm64[1];
        return disassemResult;
    } else if (platform === 'linux') {
        var HttpURLConnection = Java.use("java.net.HttpURLConnection");
        var URL = Java.use("java.net.URL");
        var BufferedReader = Java.use("java.io.BufferedReader");
        var BufferedWriter = Java.use("java.io.BufferedWriter");
        var BufferedOutputStream = Java.use("java.io.BufferedOutputStream");
        var OutputStreamWriter = Java.use("java.io.OutputStreamWriter");
        var StringBuilder = Java.use("java.lang.StringBuilder");
        var InputStreamReader = Java.use("java.io.InputStreamReader");

        var url = URL.$new(Java.use("java.lang.String").$new('https://armconverter.com/api/convert'));
        var conn = url.openConnection();
        conn = Java.cast(conn, HttpURLConnection);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setDoInput(true);
        conn.setDoOutput(true);
        conn.setChunkedStreamingMode(0);

        const os = conn.getOutputStream();
        const out = BufferedOutputStream.$new(os);
        const osw = OutputStreamWriter.$new(out, Java.use("java.lang.String").$new("UTF-8"));
        var writer = BufferedWriter.$new(osw);
        let jsonBody = askStr.toString();
        writer.$super.write(Java.use("java.lang.String").$new(jsonBody));
        writer.flush();
        writer.close();
        os.close();

        conn.connect();
        var code = conn.getResponseCode();
        var ret = null;
        if (code == 200) {
            var inputStream = conn.getInputStream();
            var buffer = BufferedReader.$new(InputStreamReader.$new(inputStream));
            var sb = StringBuilder.$new();
            var line = null;
            while ((line = buffer.readLine()) != null) {
                sb.append(line);
            }
            var data = sb.toString();
            var obj = JSON.parse(data);
            var disassemResult = obj.asm.arm64[1];
            return disassemResult;
        } else {
            console.log(`[!] armconverter.com connection error`);
            GUObjectArray = null;
            conn.disconnect();
            return;
        }
    }
}

// Find GUObjectArray
function findGUObjectArray(moduleName) {
    GUObjectArray = Module.findExportByName(moduleName, "GUObjectArray");
    // Seems GUObjectArray exported on Android, only iOS matter?
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
            console.log(`[*] Found FUObjectArray::AllocateObjectPool(&GUObjectArray, int, int, bool) pattern at ${match[0].address}`);
            console.log(`[*] Disassemble it using armconvert.com`)
            var arrayBuff = new Uint8Array(match[0].address.add(0xc).readByteArray(8));
            var hex = bytes2hex(arrayBuff);
            var result = armConvert(hex, match[0].address.add(0xc).sub(module.base), arch);
            var adrp = result.match(/adrp.*#([0-9a-fx]+)/)[1];
            var add = result.match(/add.*#([0-9a-fx]+)/)[1];
            var offset_GUObjectArray = ptr(adrp).add(ptr(add));
            console.log(`[*] offset of GUObjectArray from the base address: ${offset_GUObjectArray}`);
            GUObjectArray = module.base.add(offset_GUObjectArray);
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
        if (findAppId() === 'com.proximabeta.mf.uamo' || findAppId() === "com.netease.ma100asia" || findAppId() === "com.netease.dbdena") {
            /* Arena Breakout, Dead by Daylight pattern */
            pattern = "?1 ?? ff ?0 ?? ?? ?? ?1 ?? ?? ?3 ?1 ?? ?? ?? 9? ?0 ?? ?? ?0 00 ?? ?? f9"
        } else if (findAppId() === "com.wemade.nightcrows") {
            /* Night Crows pattern */
            pattern = "?1 ?? ff ?0 ?? ?? ?? ?1 21 ?? 1? 91 ?? ?? ?? 9? ?0 ?? ?? ?0 00 ?? ?? f9"
        } else {
            pattern = "e1 ?? 40 b9 e2 ?? 40 b9 e3 ?? 40 39";
        }
        scanMemoryForGUObjectArray(module.base, module.size, pattern);

        var int = setInterval(() => {
            if ((GUObjectArrayPatternFoundAddr !== undefined) && (ptr(GUObjectArrayPatternFoundAddr) != "0x0")) {
                console.log(`[*] GUObjectArray pattern found at ${GUObjectArrayPatternFoundAddr}`);
                console.log(`[*] Disassemble it using armconvert.com`)
                if (findAppId() === 'com.proximabeta.mf.uamo' || findAppId() === "com.wemade.nightcrows" || findAppId() === "com.netease.ma100asia" || findAppId() === "com.netease.dbdena") {
                    var arrayBuff = new Uint8Array(GUObjectArrayPatternFoundAddr.add(0x10).readByteArray(8));
                    var hex = bytes2hex(arrayBuff);
                    var result = armConvert(hex, GUObjectArrayPatternFoundAddr.add(0x10).sub(module.base), arch);
                    var adrp = result.match(/adrp.*#([0-9a-fx]+)/)[1];
                    var ldr = result.match(/ldr.*#([0-9a-fx]+)/)[1];
                    var offset_GUObjectArray_ptr = ptr(adrp).add(ptr(ldr));
                    console.log(`[*] offset of GUObjectArray_ptr from the base address: ${offset_GUObjectArray_ptr}`);
                    GUObjectArray = module.base.add(offset_GUObjectArray_ptr).readPointer();
                } else if (findAppId() === 'com.miraclegames.farlight84') {
                    var arrayBuff = new Uint8Array(GUObjectArrayPatternFoundAddr.sub(0x4).readByteArray(4));
                    var hex = bytes2hex(arrayBuff);
                    var result = armConvert(hex, GUObjectArrayPatternFoundAddr.sub(0x4).sub(module.base), arch);
                    var adrp = result.match(/adrp.*#([0-9a-fx]+)/)[1];
                    arrayBuff = new Uint8Array(GUObjectArrayPatternFoundAddr.add(0xc).readByteArray(4));
                    hex = bytes2hex(arrayBuff);
                    result = armConvert(hex, GUObjectArrayPatternFoundAddr.add(0xc).sub(module.base), arch);
                    var ldr = result.match(/ldr.*#([0-9a-fx]+)/)[1];
                    var offset_GUObjectArray_ptr = ptr(adrp).add(ptr(ldr));
                    console.log(`[*] offset of GUObjectArray_ptr from the base address: ${offset_GUObjectArray_ptr}`);
                    GUObjectArray = module.base.add(offset_GUObjectArray_ptr).readPointer();
                } else {
                    var arrayBuff = new Uint8Array(GUObjectArrayPatternFoundAddr.add(0xc).readByteArray(8));
                    var hex = bytes2hex(arrayBuff);
                    var result = armConvert(hex, GUObjectArrayPatternFoundAddr.add(0xc).sub(module.base), arch);
                    try {
                        var adrp = result.match(/adrp.*#([0-9a-fx]+)/)[1];
                        var add = result.match(/add.*#([0-9a-fx]+)/)[1];
                        var offset_GUObjectArray = ptr(adrp).add(ptr(add));
                        console.log(`[*] offset of GUObjectArray from the base address: ${offset_GUObjectArray}`);
                        GUObjectArray = module.base.add(offset_GUObjectArray);
                    } catch (e) {
                        console.log(e.stack);
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
        var pm = Java.use('android.app.ActivityThread').currentApplication();
        return pm.getApplicationContext().getPackageName();
    } else {
        return ObjC.classes.NSBundle.mainBundle().bundleIdentifier().toString();
    }
}

function set(moduleName) {
    moduleBase = Module.findBaseAddress(moduleName);
    findGUObjectArray(moduleName);
    findGName(moduleName);
    var appId = findAppId();
    setOffset(appId);

    var int = setInterval(() => {
        if ((GName !== undefined && GName !== null) && (GUObjectArray !== undefined && GUObjectArray !== null)) {
            console.log(`\n[*] set ${moduleName} base: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        } else if ((GName !== undefined && GName !== null) && GUObjectArray === undefined) {
            console.log(`\n[*] set ${moduleName} base: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        } else if (GName === null && (GUObjectArray !== undefined && GUObjectArray !== null)) {
            console.log(`\n[*] set ${moduleName} base: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        } else if (GName === null && GUObjectArray === undefined) {
            console.log(`\n[*] set ${moduleName} base: ${moduleBase}, GUObjectArray: ${GUObjectArray}, GName: ${GName}`);
            clearInterval(int);
            return;
        }
    }, 0);
}
