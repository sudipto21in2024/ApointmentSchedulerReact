FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/UserService/UserService.csproj", "./"]
RUN dotnet restore "./UserService.csproj"
COPY . .
WORKDIR "/src/backend/services/UserService"
RUN dotnet build "UserService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "UserService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "UserService.dll"]