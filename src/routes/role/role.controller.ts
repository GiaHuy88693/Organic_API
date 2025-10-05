import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import {
  AssignPermissionToRoleDTO,
  AssignPermissionToRoleResDTO,
  AssignRolesToUserResDTO,
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  RoleIdParamDTO,
  UserIdParamDTO,
  UpdateRoleBodyDTO,
} from './dto/role.dto';
import { RoleService } from './role.service';
import { AuthTypes, ConditionGuard } from 'src/shared/constants/auth.constant';
import { Auth } from 'src/shared/decorator/auth.decorator';
import { MessageResDTO } from '../auth/dto/auth.dto';
import { parseSkipTake } from 'src/utils/pagination.util';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  /**
   * Creates a new role in the system.
   * Requires Bearer authentication. The `userId` of the currently authenticated user
   * will be set as the creator of the role.
   * @param body - The DTO containing role details (name, description, isActive).
   * @param userId - The ID of the currently authenticated user (extracted from access token).
   * @returns The created role record without soft-delete fields.
   */
  @Auth([AuthTypes.BEARER])
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
    type: CreateRoleResDTO,
  })
  @ZodSerializerDto(CreateRoleResDTO)
  async createRole(
    @Body() body: CreateRoleBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return await this.roleService.createRole({
      data: body,
      createdById: userId,
    });
  }

  /**
   * Assigns a list of permissions to an existing role.
   * Requires Bearer authentication. The specified role will have its permissions
   * replaced with the provided list (`set` behavior).
   * @param params - Object containing `roleId` as a path parameter.
   * @param body - The DTO containing an array of permission IDs to assign.
   * @returns The updated role with its assigned permissions.
   */
  @Auth([AuthTypes.BEARER])
  @Post(':roleId/permissions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permissions assigned successfully',
    type: AssignPermissionToRoleResDTO,
  })
  @ZodSerializerDto(AssignPermissionToRoleResDTO)
  async assignPermissionToRole(
    @Param() params: RoleIdParamDTO,
    @Body() body: AssignPermissionToRoleDTO,
  ) {
    return await this.roleService.assignPermissionToRole(params.roleId, body);
  }

  /**
   * Assigns (replaces) a user's single role.
   * Requires Bearer authentication. The `userId` of the currently authenticated user
   * will be recorded as the actor (`updatedById`) who performed the change.
   * @param params - DTO containing the target `userId` from the route path.
   * @param body   - DTO containing the `roleId` to assign to the user.
   * @param userId - ID of the authenticated admin/actor (extracted from the access token).
   * @returns The updated user record including its current role (response serialized by `AssignRolesToUserResDTO`).
   */
  @Auth([AuthTypes.BEARER])
  @Put('users/:userId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set user role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User role updated',
    type: AssignRolesToUserResDTO,
  })
  @ZodSerializerDto(AssignRolesToUserResDTO)
  async assignRolesToUser(
    @Param() params: UserIdParamDTO,
    @Body() body: RoleIdParamDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return await this.roleService.assignRolesToUser({
      id: params.userId,
      data: body,
      updatedById: userId,
    });
  }
  /**
   * Retrieves a list of all roles in the system.
   * Requires Bearer or API Key authentication with Admin role.
   * @returns An array of roles.
   */
  @Auth([AuthTypes.BEARER, AuthTypes.APIKey], { condition: ConditionGuard.OR })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles fetched',
    type: CreateRoleResDTO,
    isArray: true,
  })
  async listRoles(
    @ActiveUser('userId') userId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const { skip: parsedSkip, take: parsedTake } = parseSkipTake(skip, take);
    return this.roleService.listRoles(parsedSkip, parsedTake);
  }

  /**
   * Retrieves details of a specific role by its ID.
   * Requires Bearer or API Key authentication with Admin role.
   * @param params - Object containing `roleId` as a path parameter.
   * @returns The role details if found.
   */
  @Auth([AuthTypes.BEARER, AuthTypes.APIKey], { condition: ConditionGuard.OR })
  @Get(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role detail',
    type: CreateRoleResDTO,
  })
  async getRole(@Param() params: RoleIdParamDTO) {
    return await this.roleService.getRoleById(params.roleId);
  }

  /**
   * Updates an existing role by its ID.
   * Requires Bearer or API Key authentication with Admin role.
   * @param params - Object containing `roleId` as a path parameter.
   * @param body - Partial DTO containing fields to update (name, description, isActive).
   * @returns The updated role record.
   */
  @Auth([AuthTypes.BEARER, AuthTypes.APIKey], { condition: ConditionGuard.OR })
  @Patch(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated',
    type: CreateRoleResDTO,
  })
  @ZodSerializerDto(CreateRoleResDTO)
  async updateRole(
    @Param() params: RoleIdParamDTO,
    @Body() body: UpdateRoleBodyDTO,
  ) {
    return await this.roleService.updateRole(params.roleId, body);
  }

  /**
   * Soft deletes an existing role by its ID (marks as deleted but keeps record).
   * Requires Bearer or API Key authentication with Admin role.
   * @param params - Object containing `roleId` as a path parameter.
   * @returns A message indicating successful deletion.
   */
  @Auth([AuthTypes.BEARER, AuthTypes.APIKey], { condition: ConditionGuard.OR })
  @Delete(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete role (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted',
    type: MessageResDTO,
  })
  @ZodSerializerDto(MessageResDTO)
  async deleteRole(@Param() params: RoleIdParamDTO) {
    return await this.roleService.softDeleteRole(params.roleId);
  }

  /**
   * Restores a previously soft-deleted role by its ID.
   * Requires Bearer or API Key authentication with Admin role.
   * @param params - Object containing `roleId` as a path parameter.
   * @returns A message indicating successful restoration.
   */
  @Auth([AuthTypes.BEARER, AuthTypes.APIKey], { condition: ConditionGuard.OR })
  @Patch(':roleId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role restored',
    type: MessageResDTO,
  })
  @ZodSerializerDto(MessageResDTO)
  async restoreRole(@Param() params: RoleIdParamDTO) {
    return await this.roleService.restoreRole(params.roleId);
  }
}
