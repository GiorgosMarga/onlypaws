"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("../validators/uuid");
var BadRequestError_1 = require("../errors/BadRequestError");
var userInfo_1 = require("../services/userInfo");
var NotFoundError_1 = require("../errors/NotFoundError");
var http_status_codes_1 = require("http-status-codes");
var NotAuthorizedError_1 = require("../errors/NotAuthorizedError");
var userInfo_2 = require("../validators/userInfo");
var InternalServerError_1 = require("../errors/InternalServerError");
var crypto_1 = require("crypto");
var client_s3_1 = require("@aws-sdk/client-s3");
var s3Bucket_1 = require("../s3Bucket");
var errors_1 = require("../errors");
var parseValidationError_1 = require("../utils/parseValidationError");
var redisClient_1 = require("../redisClient");
var createUserInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userInfoBody, validationError, userAvatarUrl, dogAvatarUrl, userParams, dogParams, userCommand, dogCommand, err_1, userInfo, insertedUserInfo, exists;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                user = req.user;
                userInfoBody = JSON.parse(req.body.userInfo);
                if (!userInfoBody) {
                    throw new errors_1.default.BadRequestError({ message: "User info is required" });
                }
                validationError = userInfo_2.default.userInfoInsertSchema.validate(userInfoBody, { abortEarly: false }).error;
                if (validationError) {
                    throw new errors_1.default.ValidationError({ message: (0, parseValidationError_1.default)(validationError) });
                }
                if (!req.files) {
                    throw new errors_1.default.BadRequestError({ message: "Two avatars are required" });
                }
                if (!req.files["userPic"]) {
                    throw new errors_1.default.BadRequestError({ message: "Please upload you profile image." });
                }
                if (!req.files["dogPic"]) {
                    throw new errors_1.default.BadRequestError({ message: "Please upload you dog's cute face." });
                }
                if (!req.files) return [3 /*break*/, 5];
                userParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: (0, crypto_1.randomUUID)(),
                    Body: (_a = req.files["userPic"][0]) === null || _a === void 0 ? void 0 : _a.buffer,
                    ContentType: (_b = req.files["userPic"][0]) === null || _b === void 0 ? void 0 : _b.mimetype
                };
                dogParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: (0, crypto_1.randomUUID)(),
                    Body: (_c = req.files["dogPic"][0]) === null || _c === void 0 ? void 0 : _c.buffer,
                    ContentType: (_d = req.files["dogPic"][0]) === null || _d === void 0 ? void 0 : _d.mimetype
                };
                userCommand = new client_s3_1.PutObjectCommand(userParams);
                dogCommand = new client_s3_1.PutObjectCommand(dogParams);
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all([
                        s3Bucket_1.s3Client.send(userCommand),
                        s3Bucket_1.s3Client.send(dogCommand)
                    ])];
            case 2:
                _e.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _e.sent();
                throw new errors_1.default.InternalServerError({ message: "Could not upload avatars" });
            case 4:
                userAvatarUrl = "https://".concat(process.env.BUCKET_NAME, ".s3.").concat(process.env.BUCKET_REGION, ".amazonaws.com/").concat(userParams.Key);
                dogAvatarUrl = "https://".concat(process.env.BUCKET_NAME, ".s3.").concat(process.env.BUCKET_REGION, ".amazonaws.com/").concat(dogParams.Key);
                _e.label = 5;
            case 5:
                userInfo = __assign(__assign({}, userInfoBody), { userId: user.id, birthDate: new Date(userInfoBody["birthDate"]), userAvatar: userAvatarUrl, dogAvatar: dogAvatarUrl });
                return [4 /*yield*/, userInfo_1.default.fetchUserInfo(user.id)];
            case 6:
                exists = _e.sent();
                if (!exists) return [3 /*break*/, 8];
                return [4 /*yield*/, userInfo_1.default.updateUserInfo(userInfo)];
            case 7:
                insertedUserInfo = _e.sent();
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, userInfo_1.default.insertUserInfo(userInfo)];
            case 9:
                insertedUserInfo = _e.sent();
                _e.label = 10;
            case 10:
                if (!insertedUserInfo) {
                    throw new InternalServerError_1.default({ message: "Could not insert a userInfo: " + userInfo });
                }
                res.status(http_status_codes_1.StatusCodes.CREATED).json({ userInfo: insertedUserInfo });
                return [2 /*return*/];
        }
    });
}); };
var updateUserInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, validationError, validationUpdateError, userInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params["userId"];
                user = req.user;
                validationError = uuid_1.uuidSchema.validate(id).error;
                if (validationError) {
                    throw new errors_1.default.ValidationError({ message: (0, parseValidationError_1.default)(validationError) });
                }
                if (user.id !== id && user.role !== "ADMIN") {
                    throw new NotAuthorizedError_1.default({ message: "You are not authorized to perform this action." });
                }
                validationUpdateError = userInfo_2.default.userInfoUpdateSchema.validate(req.body).error;
                if (validationUpdateError) {
                    throw new errors_1.default.ValidationError({ message: (0, parseValidationError_1.default)(validationUpdateError) });
                }
                return [4 /*yield*/, userInfo_1.default.updateUserInfo(__assign(__assign({}, req.body), { userId: id }))];
            case 1:
                userInfo = _a.sent();
                if (!userInfo) {
                    throw new NotFoundError_1.default({ message: "Could not find userInfo for user: ".concat(id) });
                }
                res.status(http_status_codes_1.StatusCodes.OK).json({ userInfo: userInfo });
                return [2 /*return*/];
        }
    });
}); };
var deleteUserInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, validationError, userInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params["userId"];
                user = req.user;
                validationError = uuid_1.uuidSchema.validate(id).error;
                if (validationError) {
                    throw new BadRequestError_1.default({ message: "Invalid id" });
                }
                if (user.id !== id && user.role !== "ADMIN") {
                    throw new NotAuthorizedError_1.default({ message: "You are not authorized to perform this action." });
                }
                return [4 /*yield*/, userInfo_1.default.deleteUserInfo(id)];
            case 1:
                userInfo = _a.sent();
                if (!userInfo) {
                    throw new NotFoundError_1.default({ message: "Could not find userInfo for user: ".concat(id) });
                }
                res.status(http_status_codes_1.StatusCodes.OK).json({ userInfo: userInfo });
                return [2 /*return*/];
        }
    });
}); };
var getUserInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, validationError, cachedUserInfo, userInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params["userId"];
                validationError = uuid_1.uuidSchema.validate(id).error;
                if (validationError) {
                    throw new BadRequestError_1.default({ message: "Invalid id: ".concat(id) });
                }
                return [4 /*yield*/, redisClient_1.redisClient.get("userInfo-".concat(id))];
            case 1:
                cachedUserInfo = _a.sent();
                if (cachedUserInfo) {
                    console.log("Cache hit");
                    return [2 /*return*/, res.status(http_status_codes_1.StatusCodes.OK).json({ userInfo: JSON.parse(cachedUserInfo) })];
                }
                return [4 /*yield*/, userInfo_1.default.fetchUserInfo(id)];
            case 2:
                userInfo = _a.sent();
                if (!userInfo) {
                    throw new NotFoundError_1.default({ message: "Could not find userInfo for user: ".concat(id) });
                }
                return [4 /*yield*/, redisClient_1.redisClient.setEx("userInfo-".concat(id), 10, JSON.stringify(userInfo))];
            case 3:
                _a.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json({ userInfo: userInfo });
                return [2 /*return*/];
        }
    });
}); };
exports.default = {
    createUserInfo: createUserInfo,
    updateUserInfo: updateUserInfo,
    deleteUserInfo: deleteUserInfo,
    getUserInfo: getUserInfo
};
