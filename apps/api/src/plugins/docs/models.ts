import {
    healthDTOSchema,
    healthErrorCodeSchema,
    healthErrorResponseSchema,
    healthResponseSchema,
    systemServicesSchema,
} from '@insignia/contracts/health';
import {
    createOrganizationDtoSchema,
    deleteOrganizationDtoSchema,
    organizationDtoSchema,
    organizationErrorCodeSchema,
    organizationErrorResponseSchema,
    organizationNotFoundErrorResponseSchema,
    organizationResponseSchema,
    paginatedOrganizationsResponseSchema,
    publicOrganizationDtoSchema,
    takeOrganizationsQuerySchema,
    updateOrganizationDtoSchema,
} from '@insignia/contracts/organizations';
import {
    apiErrorResponseSchema,
    apiResponseSchema,
    commonErrorCodeSchema,
    internalServerErrorResponseSchema,
    notImplementedResponseSchema,
    paginationMetaSchema,
    paginationQuerySchema,
    serviceUnavailableResponseSchema,
    validationErrorDetailsSchema,
    validationErrorResponseSchema,
    validationFieldsSchema,
} from '@insignia/contracts/response';
import {
    deleteTelegramAccountDtoSchema,
    deleteUserDtoSchema,
    paginatedPublicUsersResponseSchema,
    publicUserDtoSchema,
    publicUserResponseSchema,
    syncTelegramAccountDtoSchema,
    takeTelegramAccountByIdParamsSchema,
    takeUserByIdParamsSchema,
    takeUsersQuerySchema,
    telegramAccountDtoSchema,
    telegramAccountErrorCodeSchema,
    telegramAccountErrorResponseSchema,
    telegramAccountNotFoundErrorResponseSchema,
    telegramAccountResponseSchema,
    updateTelegramAccountDtoSchema,
    updateUserDtoSchema,
    userErrorCodeSchema,
    userErrorResponseSchema,
    userNotFoundErrorResponseSchema,
    userProfileDtoSchema,
    userProfileResponseSchema,
} from '@insignia/contracts/users';

export const docsModels = {
    // Общие конверты, пагинация и ошибки API
    CommonErrorCode: commonErrorCodeSchema,
    ApiResponse: apiResponseSchema,
    ApiErrorResponse: apiErrorResponseSchema,
    PaginationMeta: paginationMetaSchema,
    PaginationQuery: paginationQuerySchema,
    ValidationFields: validationFieldsSchema,
    ValidationErrorDetails: validationErrorDetailsSchema,
    ValidationErrorResponse: validationErrorResponseSchema,
    InternalServerErrorResponse: internalServerErrorResponseSchema,
    ServiceUnavailableResponse: serviceUnavailableResponseSchema,
    NotImplementedResponse: notImplementedResponseSchema,

    // Системный мониторинг и состояние
    SystemServices: systemServicesSchema,
    HealthErrorCode: healthErrorCodeSchema,
    HealthDTO: healthDTOSchema,
    HealthResponse: healthResponseSchema,
    HealthErrorResponse: healthErrorResponseSchema,

    // Пользователи, профили и операции
    UserErrorCode: userErrorCodeSchema,
    UserErrorResponse: userErrorResponseSchema,
    UserNotFoundErrorResponse: userNotFoundErrorResponseSchema,
    TakeUserByIdParams: takeUserByIdParamsSchema,
    TakeUsersQuery: takeUsersQuerySchema,
    PublicUserDTO: publicUserDtoSchema,
    PublicUserResponse: publicUserResponseSchema,
    PaginatedPublicUsersResponse: paginatedPublicUsersResponseSchema,
    UserProfileDTO: userProfileDtoSchema,
    UserProfileResponse: userProfileResponseSchema,
    UpdateUserDTO: updateUserDtoSchema,
    DeleteUserDTO: deleteUserDtoSchema,

    // Аккаунты Telegram
    TelegramAccountDTO: telegramAccountDtoSchema,
    TelegramAccountResponse: telegramAccountResponseSchema,
    TelegramAccountErrorCode: telegramAccountErrorCodeSchema,
    TelegramAccountErrorResponse: telegramAccountErrorResponseSchema,
    TelegramAccountNotFoundErrorResponse:
        telegramAccountNotFoundErrorResponseSchema,
    SyncTelegramAccountDTO: syncTelegramAccountDtoSchema,
    UpdateTelegramAccountDTO: updateTelegramAccountDtoSchema,
    DeleteTelegramAccountDTO: deleteTelegramAccountDtoSchema,
    TakeTelegramAccountByIdParams: takeTelegramAccountByIdParamsSchema,

    // Организации
    OrganizationDTO: organizationDtoSchema,
    PublicOrganizationDTO: publicOrganizationDtoSchema,
    OrganizationResponse: organizationResponseSchema,
    PaginatedOrganizationsResponse: paginatedOrganizationsResponseSchema,
    OrganizationErrorCode: organizationErrorCodeSchema,
    OrganizationErrorResponse: organizationErrorResponseSchema,
    OrganizationNotFoundErrorResponse: organizationNotFoundErrorResponseSchema,
    CreateOrganizationDTO: createOrganizationDtoSchema,
    UpdateOrganizationDTO: updateOrganizationDtoSchema,
    DeleteOrganizationDTO: deleteOrganizationDtoSchema,
    TakeOrganizationsQuery: takeOrganizationsQuerySchema,
};

export type DocsModels = typeof docsModels;
